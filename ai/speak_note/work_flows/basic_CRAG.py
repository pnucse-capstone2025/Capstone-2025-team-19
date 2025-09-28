from langgraph.graph import END, StateGraph, START
from langchain.schema import Document
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel, Field
from typing import Annotated, List
from typing_extensions import TypedDict

from speak_note.prompts import english_prompt
from speak_note.prompts import prompt
from speak_note.tools import llms
# from speak_note.instance.context import Context
# from speak_note.work_flows.RAG import basic_RAG
from langchain_teddynote.tools.tavily import TavilySearch
from abc import ABC, abstractmethod


class GraphState(TypedDict):
    question: Annotated[str, "The question to answer"]
    generation: Annotated[str, "The generation from the LLM"]
    web_search: Annotated[str, "Whether to add search"]
    documents: Annotated[List[str], "The documents retrieved"]
    most_relevant_pagenum : Annotated[List[int], "most_relevant_pagenum"] # 추가부분


class GradeDocuments(BaseModel):
    binary_score: str = Field(description="Documents are relevant to the question, 'yes' or 'no'")


class Workflow:
    # 공통 API ainvoke(str)를 갖는다.
    @abstractmethod
    async def ainvoke(self, question: str) -> str:
        ...

'''
Workflow
    |---- CRAG
    |        |-- en_CRAG
    |
    |
    |
    |
'''

def ensure_graphstate(state: dict) -> GraphState:
    return {
        "question": state.get("question"),
        "generation": state.get("generation"),
        "web_search": state.get("web_search"),
        "documents": state.get("documents", []),
        "most_relevant_pagenum": state.get("most_relevant_pagenum", [])
    }


class CRAG(Workflow):
    # 각자 고유한 workflow를 가진다.
    def __init__(self, rag_pipeline, llm_list=llms.llm_list):
        self.llm_list = llm_list
        self.rag_pipeline = rag_pipeline
        self.re_write_prompt = prompt.re_write_prompt
        self.web_search_prompt = prompt.prompt_to_refine_text
        self.grade_prompt = prompt.grade_prompt

        self.structured_llm_grader = llm_list["gpt-4.1-nano"].with_structured_output(GradeDocuments)
        self.retrieval_grader = self.grade_prompt | self.structured_llm_grader
        self.web_search_tool = TavilySearch(max_results=3)
        self.question_rewriter = self.re_write_prompt | llm_list["gpt-4o-mini"] | StrOutputParser()
        self.work_chain = self.define_workflow()

    # ==================== 비동기 노드 함수 ====================
    async def retrieve(self, state: GraphState):
        print("\n==== RETRIEVE ====\n")
        question = state["question"]
        documents = await self.rag_pipeline.retriever.ainvoke(question)
        state["documents"] = documents
        return ensure_graphstate(state)


    async def grade_documents(self, state: GraphState):
        print("\n==== [CHECK DOCUMENT RELEVANCE TO QUESTION] ====\n")
        question, documents = state["question"], state["documents"]
        filtered_docs = []
        relevant_doc_count = 0

        relevant_page_num_list = []  # 연관있는 문서의 페이지번호를 찾아서 저장해야함

        for d in documents:
            grade = (await self.retrieval_grader.ainvoke({"question": question, "document": d.page_content})).binary_score
            if grade == "yes":
                relevant_page_num = d.metadata["page"]  # 추가부분
                relevant_page_num_list.append(relevant_page_num)
                print("==== [GRADE: DOCUMENT RELEVANT] ====")
                filtered_docs.append(d)
                relevant_doc_count += 1
            else:
                print("==== [GRADE: DOCUMENT NOT RELEVANT] ====")

        state["web_search"] = "Yes" if relevant_doc_count == 0 else "No"
        state["documents"] = filtered_docs
        state["most_relevant_pagenum"] = relevant_page_num_list
        return ensure_graphstate(state)

    
    async def query_rewrite(self, state: GraphState):
        print("\n==== [REWRITE QUERY] ====\n")
        better_question = await self.question_rewriter.ainvoke(state["question"])
        state["question"] = better_question
        return ensure_graphstate(state)
    

    async def web_search(self, state: GraphState):
        print("\n==== [WEB SEARCH] ====\n")
        question = state["question"]
        docs = await self.web_search_tool.ainvoke({"query": question})
        context = docs[0] if docs else await self.llm_list["gpt-4o-mini"].ainvoke(question)

        web_search_prompt = self.web_search_prompt
        messages = web_search_prompt.format(context=context, question=question)

        generation = await self.rag_pipeline.RAG_ainvoke(msg=messages, llm=self.llm_list["gpt-4.1"])
        state["generation"] = generation
        return ensure_graphstate(state)


    async def generate(self, state: GraphState):
        print("\n==== GENERATE ====\n")
        generation = await self.rag_pipeline.RAG_ainvoke(msg=state["question"], llm=self.llm_list["gpt-4.1"])
        state["generation"] = generation
        return ensure_graphstate(state)

    async def passthrough(self, state: GraphState):
        print("==== [PASS THROUGH] ====")
        print("Final Answer:", state.get("generation", "[NO GENERATION]"))
        return ensure_graphstate(state)


    def decide_to_generate(self, state: GraphState): # Non state return func
        print("==== [ASSESS GRADED DOCUMENTS] ====")
        return "web_search_node" if state["web_search"] == "Yes" else "generate"

    # ==================== 그래프 정의 ====================

    def define_workflow(self):
        workflow = StateGraph(GraphState)
        workflow.add_node("retrieve", self.retrieve)
        workflow.add_node("grade_documents", self.grade_documents)
        workflow.add_node("generate", self.generate)
        workflow.add_node("query_rewrite", self.query_rewrite)
        workflow.add_node("web_search_node", self.web_search)
        workflow.add_node("pass", self.passthrough)

        workflow.add_edge(START, "query_rewrite")
        workflow.add_edge("query_rewrite", "retrieve")
        workflow.add_edge("retrieve", "grade_documents")

        workflow.add_conditional_edges(
            "grade_documents",
            self.decide_to_generate,
            {
                "web_search_node": "web_search_node",
                "generate": "generate",
            },
        )
        workflow.add_edge("generate", "pass")
        workflow.add_edge("web_search_node", "pass")
        workflow.add_edge("pass", END)

        return workflow.compile()

    # ==================== 비동기 진입점 ====================

    async def ainvoke(self, question: str):
        response = await self.work_chain.ainvoke({"question": question})
        return response







class en_CRAG(CRAG):
    def __init__(self, rag_pipeline, llm_list=llms.llm_list):
        self.llm_list = llm_list
        self.rag_pipeline = rag_pipeline
        self.grade_prompt = english_prompt.grade_prompt
        self.re_write_prompt = english_prompt.re_write_prompt
        self.web_search_prompt = english_prompt.prompt_to_refine_text

        self.structured_llm_grader = llm_list["gpt-4o-mini"].with_structured_output(GradeDocuments)
        self.retrieval_grader = self.grade_prompt | self.structured_llm_grader
        self.web_search_tool = TavilySearch(max_results=3)
        self.question_rewriter = self.re_write_prompt | llm_list["gpt-4o-mini"] | StrOutputParser()
        self.work_chain = self.define_workflow()
