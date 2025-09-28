# /text POST

{
  "input": {
    "text": "삼성전자가 개발한 생성형 AI 의 이름은?"
  },
  "output": {
    "success_doc_answer": {
      "voice": "삼성전자가 개발한 생성형 AI의 이름은 무엇인가요?",
      "refinedText": "삼성전자가 개발한 생성형 AI의 이름은 '삼성 가우스'(Samsung Gauss)입니다.",
      "refinedMarkdown": "## 답변\n- 삼성전자가 개발한 생성형 AI의 이름은 '삼성 가우스'(Samsung Gauss)입니다.",
      "answerState": 0
    },
    "success_web_answer": {
      "voice": "G7 정상회의에서 AI에 대해 어떤 합의가 이루어졌는지 알려줘.",
      "refinedText": "G7 정상회의에서는 생성형 AI의 위험성과 신뢰성에 대한 가이드라인을 마련하기로 합의하였습니다.",
      "refinedMarkdown": "## 답변\n- G7 정상회의에서는 생성형 AI의 위험성과 신뢰성에 대한 가이드라인을 마련하기로 합의하였습니다.",
      "answerState": 1
    },
    "fail_no_pdf": {
      "error": "먼저 PDF를 업로드해야 합니다."
    },
    "fail_empty_text": {
      "error": "질문(text)이 비어 있습니다."
    },
    "fail_internal_error": {
      "error": "서버 내부 오류 메시지"
    }
  }
}
