from speak_note.manager.manager import Manager
from speak_note.instance.user import User

class MesseageManager(Manager):
    def __init__(self):
        super().__init__()

    '''
    자신에게 저장된 Masseage들중 finished=True인 모든객체를 리스트로 싸서 반환한다.

    # 반환 형식에시
    reuslt = {
        "totalNum": 2, // 한번에 자바로 보낼 응답 개수 (시연때는 5, 배포때는 50~100정도 될거같습니다) 
        "results": [
            {
            "userId" : 1,
            "sessionId": "sess_A",
            "jobId": "job_abc123",
            "seq": 137,
            "audioText" : "전처리 완료한 음성 인식 원본 텍스트내용1"
            "annotation": "• 핵심 요점 …",
            "requestId": "uuid-req-1"
            },
            {
            "userId" : 2,
            "sessionId": "sess_B",
            "jobId": "job_abc1234",
            "seq": 137,
            "audioText" : "전처리 완료한 음성 인식 원본 텍스트내용2"
            "annotation": "• 핵심 요점 …",
            "requestId": "uuid-req-2"
            }
        ]
    }
    '''
    def pop_all_finished(self):
        """
        자신에게 저장된 Message들 중 finished=True인 모든 객체를 리스트로 모아 반환
        동시에 내부 저장소에서는 제거
        """
        finished_list = []
        remaining_instances = []

        for inst in self.instances:
            if inst.finished:
                out = inst.to_json_output()
                if out:
                    finished_list.append(out)
            else:
                remaining_instances.append(inst)

        # 남은 애들만 다시 보관 (finished 제거됨)
        self.instances = remaining_instances

        result = {
            "totalNum": len(finished_list),
            "results": finished_list
        }
        return result
    
