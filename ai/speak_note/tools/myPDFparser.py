'''
upstage parser를 이용해서, document 형식에 맞게 시퀀셜 자연어 형태로 pdf내용을 읽어온다.
'''
import os
import requests
import asyncio
import time  
from bs4 import BeautifulSoup
from openai import OpenAI # openai==1.52.2
from typing import Callable, Dict
from langchain.schema import Document
from collections import defaultdict
from langchain_teddynote import logging
import httpx
import json
import tiktoken


from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import ChatPromptTemplate

from dotenv import load_dotenv

import speak_note.prompts.prompt as prompt
import speak_note.tools.llms as llms
import asyncio


api_key = os.getenv("UPSTAGE_API_KEY")
# API 키를 환경변수로 관리하기 위한 설정 파일
# load_dotenv() # API 키 정보 로드

llm = llms.llm_list["solar-pro2"]

def text_handler(figure_data: dict | None) -> str:
    if figure_data is None or not isinstance(figure_data, dict):
        return ""
    try:
        html = figure_data.get("content", {}).get("html", "")
        if not html:
            return ""
        soup = BeautifulSoup(html, "html.parser")
        img = soup.find("img")
        if img and img.get("alt"):
            alt_text = img.get("alt").strip()
            return f"markdown: {alt_text}, text: {alt_text}"
        return soup.get_text(separator="\n", strip=True)
    except Exception:
        return ""


async def equation_handler(equation_data_raw: tuple):
    prompt_template = PromptTemplate(
        input_variables=["equation_descript_text", "question"],
        template=prompt.equation_handler_prompt
    )

    equation_data = equation_data_raw[0]
    equation_descript_text = text_handler(equation_data_raw[1])  # 설명 문장 (텍스트 주변 문맥)
    markdown = equation_data["content"].get("html", "").strip() # markdown -> html
    text = equation_data["content"].get("text", "").strip()
    # print("==========equation=============")
    # print("markdown : ", markdown)
    # print("text : ", text)
    question = f"markdown: {markdown}, text: {text}"

    chain = (
        prompt_template
        | llm
        | StrOutputParser()
    )

    return await chain.ainvoke({
        "equation_descript_text": equation_descript_text,
        "question": question
    })

async def chart_handler(chart_data_raw: tuple):
    # 프롬프트 템플릿 구성
    prompt_template = PromptTemplate(
        input_variables=["chart_descript_text", "question"],
        template=prompt.chart_handler_prompt
    )

    # 입력 구성
    chart_data = chart_data_raw[0]["content"]["html"] ## html
    # chart_descript_text = text_handler(chart_data_raw[1])

    # Chain 생성
    chain = prompt_template | llm | StrOutputParser()
    # print("==========chart=============")
    # print("chart_descript_text : ", chart_data)    # chart_descript_text=>chart_data
    # print("chart_data : ", chart_data)

    return await chain.ainvoke({
        "chart_descript_text": chart_data,
        "question": chart_data
    })


async def figure_handler(figure_data: tuple):
    prompt_template = PromptTemplate(
        input_variables=["figure_description", "question"],
        template=prompt.figure_handler_prompt
    )

    html_content = figure_data[0]["content"]["html"]
    figure_description = text_handler(figure_data[1])

    chain = prompt_template | llm | StrOutputParser()

    # print("==========figure=============")
    # print("figure_description : ", figure_description)
    # print("html_content : ", html_content)

    return await chain.ainvoke({
        "figure_description": figure_description,
        "question": html_content
    })

category_to_handler: Dict[str, Callable] = {
    "equation": equation_handler,
    "chart": chart_handler,
    "figure": figure_handler,
}


async def parse_data_by_category(data):
    category = data[0]['category'] if isinstance(data, tuple) else data['category']
    handler = category_to_handler.get(category, lambda x: text_handler(x))
    if asyncio.iscoroutinefunction(handler):
        return await handler(data)
    else:
        return handler(data)


def find_nearest_context_text(datas, current_index, max_search_num=2):
    collected_texts = []

    # 현재 index 기준 앞쪽 탐색
    for offset in range(1, max_search_num + 1):
        idx = current_index - offset
        if idx >= 0:
            text = text_handler(datas[idx])
            if text.strip():
                collected_texts.append(text)

    # 현재 index 기준 뒤쪽 탐색
    for offset in range(1, max_search_num + 1):
        idx = current_index + offset
        if idx < len(datas):
            text = text_handler(datas[idx])
            if text.strip():
                collected_texts.append(text)

    if collected_texts:
        # print("===find_nearest_context_text collected===")
        # for t in collected_texts:
        #     print(t)
        # 여러 문장들을 합쳐 하나의 context 문자열로 반환
        return " ".join(collected_texts)

    return ""

# ----------------  ----------------
async def group_by_page_with_handlers(datas):
    tasks = []
    page_index_list = []  # 각 task의 page 번호 기록

    for i, element in enumerate(datas):
        page = element.get("page", -1)
        category = element.get("category", "")

        if category in ["chart", "figure", "equation"]:
            context_text = find_nearest_context_text(datas, i)
            pair = (element, {"content": {"html": context_text}} if context_text else None)
            tasks.append(parse_data_by_category(pair))
        else:
            tasks.append(parse_data_by_category(element))

        page_index_list.append(page)

    # 병렬 실행
    parsed_texts = await asyncio.gather(*tasks)

    # 페이지별로 정리
    page_texts = defaultdict(list)
    for page, parsed in zip(page_index_list, parsed_texts):
        page_texts[page].append(parsed)

    return [
        {"page": page, "content": "\n".join(texts)}
        for page, texts in sorted(page_texts.items())
    ]

def convert_grouped_pages_to_documents(grouped_pages):
    return [Document(page_content=p["content"], metadata={"page": p["page"]}) for p in grouped_pages]
    



# ---------------- 토큰 단위 chunk ----------------
def chunk_text_by_tokens(text: str, max_tokens: int = 800):
    """
    긴 텍스트를 토큰 단위로 나누는 함수
    - overlap=0 으로 단순 슬라이딩
    """
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)

    chunks = []
    start = 0
    while start < len(tokens):
        end = min(start + max_tokens, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text = enc.decode(chunk_tokens)
        chunks.append(chunk_text)
        start = end
    return chunks


# ---------------- 요약 ----------------
async def summarize_docs(docs, llm=llm, max_chunks=2, max_final=5):
    """
    문서 요약 (효율화 파이프라인 적용)
    - max_chunks: 앞뒤에서 선택할 chunk 수
    - max_final: 최종 요약 시 사용할 partial summary 개수
    """
    # 1) 문서 전체 텍스트 합치기
    docs_text = "\n".join([doc.page_content for doc in docs])

    # 2) 토큰 단위 chunk (overlap=0)
    chunks = chunk_text_by_tokens(docs_text, max_tokens=300)

    # 3) 균등 샘플링 (앞/중간/뒤에서 추출)
    selected_chunks = []
    if len(chunks) > 3 * max_chunks:
        selected_chunks.extend(chunks[:max_chunks])  # 앞
        mid_start = len(chunks) // 2 - max_chunks // 2
        selected_chunks.extend(chunks[mid_start:mid_start + max_chunks])  # 중간
        selected_chunks.extend(chunks[-max_chunks:])  # 뒤
    else:
        selected_chunks = chunks

    # 4) partial summaries 생성
    summarize_prompt = ChatPromptTemplate.from_messages([
        ("system", "너는 문서 내용을 짧게 요약하는 도우미야."),
        ("human", "다음 텍스트를 2~3문장으로 요약해줘:\n\n{document}")
    ])
    summarize_chain = summarize_prompt | llm | StrOutputParser()

    partial_summaries = []
    for chunk in selected_chunks:
        partial_summary = await summarize_chain.ainvoke({"document": chunk})
        partial_summaries.append(partial_summary.strip())

    # 5) 중복 제거 + 상위 m개만 선택
    unique_summaries = list(dict.fromkeys(partial_summaries))  # 순서 유지하며 중복 제거
    selected_summaries = unique_summaries[:max_final]

    # 6) 최종 요약 (단어 수 제한)
    final_input = "\n".join(selected_summaries)
    final_prompt = ChatPromptTemplate.from_messages([
        ("system", "너는 여러 요약을 하나로 합쳐 간결한 최종 요약을 만드는 도우미야."),
        ("human", "다음 요약들을 바탕으로 문서 전체의 핵심을 **50단어 이내, 2~3문장**으로 요약해줘 반환 형식은 반드시 텍스트 줄글이여야해. 요약내용 이외에는 어떤것도 출력해서 안돼.:\n\n{summaries}\n\n"
        "출력예시: 해당 문서는 판다스 라이브러리를 활용한 데이터 분석에 대한 강의문서입니다.")
    ])
    final_chain = final_prompt | llm | StrOutputParser()
    final_summary = await final_chain.ainvoke({"summaries": final_input})

    return final_summary.strip()



# ---------------- 키워드 ----------------
async def get_docs_keywords(docs, llm=llm):
    """
    문서 키워드 추출 (summarize_docs 결과 기반, Function Call 스타일 강제 JSON)
    return: list[str]
    """
    summary = await summarize_docs(docs, llm=llm)

    keyword_prompt = ChatPromptTemplate.from_messages([
        ("system", "너는 문서 요약에서 핵심 키워드를 JSON 배열로 추출하는 도우미야."),
        ("human", """요약:\n{summary}\n\n
        - 반드시 JSON 배열만 출력해.
        - 예시: ["스레드", "웹소켓", "메시지 큐"]
        - 여는 ```json 코드블록 같은 건 절대 쓰지 마.
        """)
    ])
    keyword_chain = keyword_prompt | llm | StrOutputParser()
    raw_keywords = await keyword_chain.ainvoke({"summary": summary})

    # 안전한 JSON 파싱
    try:
        keywords = json.loads(raw_keywords)
        if isinstance(keywords, list):
            return [str(k) for k in keywords]
        else:
            return [raw_keywords]
    except Exception:
        # JSON 실패 시 쉼표 분리
        return [kw.strip() for kw in raw_keywords.replace("[", "").replace("]", "").replace('"', "").split(",") if kw.strip()]

# ---------------- 최종 메서드 ----------------  
async def upstageParser2Document(file_path, tries:int = 3):
    '''
    file_path : 파싱할 문서
    tries : 서버 전달 실패시, 시도횟수

    return tuple[document, summary, keywords]

    document : Document
    summary : str
    keywords : list[str]
    '''
    start = time.perf_counter()
    print(f"[PARSER] parsing 시작: {file_path}", flush=True)

    async with httpx.AsyncClient() as client:
        with open(file_path, "rb") as f:
            for i in range(tries):
                try:
                    response = await client.post(
                        "https://api.upstage.ai/v1/document-digitization",
                        headers={"Authorization": f"Bearer {api_key}"},
                        files={"document": f},
                        data={
                            "ocr": "force",
                            "coordinates": False,
                            "chart_recognition": True,
                            "output_formats": '["html"]',
                            "base64_encoding": '["table"]',
                            "model": "document-parse"
                        },
                        timeout=120.0
                    )
                except httpx.ReadTimeout:
                    print(f"[PDF파서] ReadTimeout: {file_path}, {i+1}/{tries}회 재시도")
                    await asyncio.sleep(3)
    datas = response.json()["elements"]
    # print("[DEBUG] API 응답:", response.json())
    grouped_pages = await group_by_page_with_handlers(datas)
    result = convert_grouped_pages_to_documents(grouped_pages)

    # result의 데이터를 가지고, 2가지 작업을 해야한다.
    summary = await summarize_docs(result)
    # print("summary : ", summary)

    keywords = await get_docs_keywords(result)
    # print("keywords : ", keywords)

    end = time.perf_counter()
    print(f"[PARSER] parsing 완료: {file_path} / 소요시간: {end - start:.2f}초", flush=True)

    return result, summary, keywords


# if __name__ == "__main__":
#     file_path = "data/10 Vector Calculus.pdf"
#     documents = asyncio.run(upstageParser2Document(file_path))
#     for doc in documents:
#         print(f"[page {doc.metadata['page']}] {doc.page_content[:100]}...")
