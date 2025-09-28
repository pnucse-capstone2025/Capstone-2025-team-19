from typing import Optional
from speak_note.instance.instance import Instance
import uuid


class Message(Instance):
    def __init__(self, user_id: Optional[str] = None, chat_id: Optional[str] = None):
        super().__init__()
        self.contents = {}
        self.user_id = user_id
        self.chat_id = chat_id
        self.finished = False

        self.page = None
        self.answerState = None



    ''' 
    request = {
        "userId" : 1,
        "sessionId": "sess_A",       // 자바 세션과 1:1 매핑되는 식별자
        "seq": 137,                  // 세션 내 단조증가 시퀀스(주석 스냅샷 번호)
        "text": "STT 누적 텍스트 내용",  // 주석 생성 대상 텍스트(스냅샷)
        "lang": "ko-KR",
        "requestId": "uuid-req-1"    // 같은 작업의 중복 제출을 방지하는 키 (멱등키)
        }
    '''
    def get_request(self, request):
        """ 최초 요청(request JSON)을 Message에 반영 """
        self.user_id = request.get("userId")
        self.session_id = request.get("sessionId")
        self.seq = request.get("seq")
        self.contents["question"] = request.get("text")   # 원본 질문 저장
        self.lang = request.get("lang")
        self.request_id = request.get("requestId")
    


    '''
    result = {
        "user_id" : "user2",
        "chat_id: : "386db0e5-964c-4978-879e-29d88104e5cb",
        "id" : "a728eeff-27df-42b7-bcef-24b471b4abb4",
        "contents" : content
    }

    # result.contents["generation"] =  메세지내용 기록내용:
    # 적분의 기본 정리(FTC)에 대해 설명해 주실 수 있나요?

    # 부가설명:
    # 미적분학의 기본정리 (FTC)

    # 배경
    # - 미적분학의 기본정리는 미분과 적분의 관계를 설명하는 중요한 정리

    # 주요 내용
    # - 적분의 평균값 정리: 연속 함수 f에 대해, 특정 구간에서 평균값을 가지는 점이 존재

    # result.contents["question"] = 적분의 기본정리(FTC)를 설명해줘.
    '''

    def get_annotation(self, result: dict):
        # GraphState dict 그대로 들어옴
        self.audio_text = result.get("question")
        self.annotation = result.get("generation")
        self.finished = True

        # 페이지: 철자 호환 + 방어 로직
        page_list = result.get("most_relevant_pagenum")
        if isinstance(page_list, list) and page_list:
            self.page = page_list[0]
        else:
            self.page = None

        # 웹서치 여부 → 1/0 매핑
        web_search_val = result.get("web_search")
        if isinstance(web_search_val, str):
            self.answerState = 1 if web_search_val.lower() == "yes" else 0
        else:
            self.answerState = None


    '''
    request_output = {
                "userId" : 1,
                "sessionId": "sess_A",
                "jobId": "job_abc123",
                "seq": 137,
                "audioText" : "전처리 완료한 음성 인식 원본 텍스트내용1"
                "annotation": "• 핵심 요점 …",
                "requestId": "uuid-req-1"
                }

    # finished == True일때, 현재 상태를 위와 같은 json형식으로 바꿔서 반환
    '''
    def to_json_output(self):
        if not self.finished:
            return None
        return {
            "userId": self.user_id,
            "sessionId": self.session_id,
            "jobId": self.id,
            "seq": self.seq,
            "audioText": self.audio_text,
            "annotation": self.annotation,
            "requestId": self.request_id,
            "page": self.page,
            "answerState": self.answerState,
        }


