import asyncio
import uuid
import os
import json
from langchain.schema import Document

from langchain_community.vectorstores import FAISS
from langchain_upstage import UpstageEmbeddings
from typing import Callable, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from collections import defaultdict
from langchain_teddynote import logging

import speak_note.tools.llms as llms
import speak_note.tools.myPDFparser as myPDFparser
import speak_note.tools.en_myPDFparser as en_myPDFparser
from speak_note.work_flows.RAG  import basic_RAG
from speak_note.instance.instance import Instance

from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from speak_note.tools.llms import llm_list

def summarize_doc(docs:list):
    docs_contents = ""
    for doc in docs:
        docs_contents = docs_contents + doc.page_content + "\n"
    docs_contents
    

    summarize_prompt = """당신은 한국어로 정보를 정리해주는 스마트 어시스턴트입니다.
    당신은 문서의 내용을 간결하고 짧은 한두줄로 요약해줘야합니다. 요약정보 외엔 답변을 하지마세요.

    #User Input (요약 요청 내용):
    {question}

    #정리된 설명:
    마크다운, 기호, 등 요약내용외에 답변금지.
    """


    llm = llm_list["solar-pro2"]
    summarize_prompt_template = PromptTemplate.from_template(summarize_prompt)
    chain = (
        {"question" : lambda x: x} 
        | summarize_prompt_template
        | llm
        | StrOutputParser()
    )

    return chain.invoke(docs_contents)
'''
### retriever 하이퍼 파라미터
| 설정                                       | 설명                    | 장점                           | 단점                 |
| ---------------------------------------- | --------------------- | ---------------------------- | ------------------ |
| `k=1`                                    | 가장 유사한 문서 1개          | 빠름, 단순                       | 답변이 부실할 수 있음       |
| `k=5`, `mmr`, `lambda_mult=0.25`         | 다양한 문맥 확보, 유사도 적절히 반영 | **유사한 문서 중 다양성 확보**, 정확도+풍부함 | 느릴 수 있음            |
| `fetch_k=50`, `k=5` + `mmr`              | 후보군 확장 → Top 다양성 선택   | 유사한 문서가 많을 때 좋음              | `fetch_k`가 클수록 느려짐 |
| `score_threshold=0.8`                    | 유사도 높은 문서만 사용         | 노이즈 방지, 불필요 문서 제거            | 질의가 불명확하면 빈 결과     |
| `filter={...}`                           | 특정 조건 필터링             | 특정 context 제한 가능             | 일반 RAG엔 부적합        |
| `search_type="similarity"` + `k=5` (기본값) | 단순 유사도 정렬             | 빠르고 안정적                      | 다양성 부족 가능          |

'''

##  실험 적용하며 개선할 하이퍼 파라미터들

### 
retriever_configs = {
    "balanced": {
        "search_type": "mmr",
        "search_kwargs": {"k": 8, "score_threshold":0.5}
    },
    "strict": {
        "search_type": "similarity_score_threshold",
        "search_kwargs": {"k": 5, "score_threshold": 0.8}
    },
    "fast": {
        "search_kwargs": {"k": 2}
    }
}

### 앞으로 계속 수정할 코드.
context_configs = {
    "gpt": {
        "chunk_size": 400,
        "chunk_overlap": 50
    },
    "upstage": {
        "chunk_size": 400,
        "chunk_overlap": 50
    }
}

#  "embeddings": OpenAIEmbeddings(),
#  "embeddings": UpstageEmbeddings(model="solar-embedding-1-large"),


class Context(Instance):
    # 문서 맥락정보 
    # Context생성 -> set_context -> set_retriever 파이프라인으로 작업이 완료된다.
    # Context생성은 한번에 여러 요청이 들어올수있다.
    def __init__(self, session_id, document, user_id, summary, keywords):
        # self.id = uuid.uuid4() #현재생성시간
        # super.__init__()  # 제거ㅣ.
        self.id = session_id ### 추가기능
        self.user_id = user_id
        self.document = document
        self.keywords = keywords
        self.summary = summary
        print("user id : ", self.user_id)
        print("session id : ", self.id)
        
        # default로 "gpt"기반, "balance"로 생성.
        self.set_context(context_config=context_configs["gpt"], embedding=OpenAIEmbeddings())
        self.set_retriever(retriever_config=retriever_configs["balanced"])
        self.basic_RAG = basic_RAG(self.retriever)

    @classmethod # 인스턴스(self)가 아닌 클래스 자체(cls)를 첫 번째 인자로 받음
    async def create(cls, document_path: str, user_id, session_id):  # cls는 일반적으로 "클래스 자신"을 가리키는 변수명

        # 수정부분.
        document, summary, keywords = await myPDFparser.upstageParser2Document(file_path=document_path)
        # cls.summary = summary   
        # cls.keywords = keywords
        return cls(session_id, document, user_id, summary, keywords) # session_id

    def set_context(self, context_config, embedding):
        self.text_splitter = RecursiveCharacterTextSplitter(**context_config)
        self.split_documents = self.text_splitter.split_documents(self.document)
        self.vectorstore = FAISS.from_documents(documents=self.split_documents, embedding=embedding)

    def set_retriever(self, retriever_config):
        self.retriever = self.vectorstore.as_retriever(**retriever_config)

    def get_retriever(self):
        return self.retriever

    def to_json_file(self, save_root: str):
        # 디렉토리 자동 생성
        os.makedirs(save_root, exist_ok=True)
        # user_id의 파일명 안전성 보장 (불필요 특수문자 제거 등은 필요 시 추가)
        filename = f"{self.user_id}.json"
        save_path = os.path.join(save_root, filename)

        document_texts = [doc.page_content for doc in self.document]
        summarize = summarize_doc(self.document)
        data = {
            "user_id": self.user_id,
            "document": document_texts,
            "summarize": summarize
        }
        with open(save_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)



    

class en_Context(Context):
    @classmethod
    async def create(cls, document_path: str):
        document = await en_myPDFparser.upstageParser2Document(file_path=document_path)
        return cls(document)



def load_context_from_json(json_root: str, user_id=None, embedding=None, context_config=None, retriever_config=None):
    '''
    json_root, user_id를 인자로 받아서, user_id에 해당하는 .json 파일을 읽고 Context 복원
    '''
    if user_id is None:
        raise ValueError("user_id를 반드시 지정해야 합니다.")

    json_path = os.path.join(json_root, f"{user_id}.json")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    document_objs = [Document(page_content=content) for content in data["document"]]
    embedding = embedding if embedding is not None else OpenAIEmbeddings()
    context_config = context_config if context_config is not None else context_configs["gpt"]
    retriever_config = retriever_config if retriever_config is not None else retriever_configs["balanced"]

    ctx = Context(document_objs, user_id)
    ctx.set_context(context_config, embedding)
    ctx.set_retriever(retriever_config)
    
    summarize = data.get("summarize", None)
    return ctx, summarize
