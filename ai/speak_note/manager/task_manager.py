from speak_note.manager.manager import Manager
from speak_note.instance.instance import Instance
from speak_note.tools.callback import send_callback # 추가부분

from collections import deque
import uuid
import time

# 귀찮으니깐 일단 여기 생성한다.
class ChatTask(Instance):
    def __init__(self, task : list):
        super().__init__()  # id 생성
        self.task = task

class ContextTask(Instance):
    def __init__(self, task : list):
        super().__init__()  # id 생성
        self.task = task


class TaskManager(Manager):
    '''
    현재 비동기 작업은 두가지다. 
    1. 문서를 업로드 받고, 채팅객체 생성
    2. 메시지를 받고, llm 답변보내기
    두가지 task를 제어할 task_manager객체를 선언했다.
    '''
    def __init__(self):
        '''
        task 객체를 담은 queue와 task 생성을 위한 list를 관리한다.
        '''
        super().__init__()
        self.tasks: dict[str, dict] = {}
        ''' 
        context_taks = [
            {"user_id": user1.id, "docs_path": "./data/10 Vector Calculus.pdf", "session_id" : "u123"},
            {"user_id": user2.id, "docs_path": "./data/sample_AI_Brief.pdf", "session_id" : "u124"}
        ]

        chat_task =  [  # {chat_id, msg}
            {chat_1.id: "적분의 기본정리(FTC)를 설명해줘."},
            {chat_2.id: "G7은 AI에 대해서 어떤 합의를 했지?"}
            ]        
        '''

        self.max_process_num = 5    # 시연용으론 5개로 한다.
        self.chat_patient = 5      # 채팅 Task 대기 시간(초)
        self.context_patient = 5   # 컨텍스트 Task 대기 시간(초)

        self.context_process_queue = deque()
        self.chat_process_queue = deque()


        self.current_context_inputs = []
        self.current_chat_inputs = []

        self.last_context_task_time = None   # 가장 최근에 생성한 context_task의 생성 시간
        self.last_chat_task_time = None      # 가장 최근에 들어온 chat_task의 생성시간.

        self.tasks: dict[str, dict] = {}
    
    async def add_task(self, job_id: str, coro):
        """
        새로운 작업을 실행하고 완료되면 complete_task 호출
        """
        result = await coro
        await self.complete_task(job_id, result)


    async def complete_task(self, job_id: str, result: dict):
        """
        Task 단위 결과를 받아서 즉시 콜백 push
        """
        print(f"[DEBUG] complete_task 호출됨: job_id={job_id}, keys={list(result.keys())}")
        self.tasks[job_id] = result

        if result.get("type") == "context":
            print("context call back 호출됨")
            payload = {
                "totalNum": len(result["contexts"]),
                "contexts": result["contexts"]
            }
            await send_callback("/callbacks/contexts", payload)

        elif result.get("type") == "annotation":
            print("annotation call back 호출됨")
            # result["results"]가 {"totalNum": n, "results": [...]} 형태일 수 있으므로 언팩
            inner = result.get("results", {})
            if isinstance(inner, dict) and "results" in inner:
                total_num = inner.get("totalNum", len(inner.get("results", [])))
                results_list = inner.get("results", [])
            else:
                results_list = inner if isinstance(inner, list) else []
                total_num = len(results_list)

            payload = {
                "totalNum": total_num,
                "results": results_list
            }
            await send_callback("/callbacks/annotations", payload)

        else:
            print(f"[TaskManager] 알 수 없는 result type: {result}")



    def create_chat_task(self, user_id, msg) -> None:
        ''' 
            단일 input들을 받아서, list형태의 task를 생성한 후, Task객체를 생성한다.

            # case1. 
            ## patient 초 안에 chat_task가 max_process_num이하의 chat_task가 들어왔을때. 
            ### 예를들어, 30초안에 5개의 task를 받을수있는데, 3개만 왔을때.

            # case2.
            ## patient 초 안에 chat_task가 max_process_num초과의 chat_task가 들어왔을때. 
            ### 예를들어, 30초안에 5개의 task를 받을수있는데, 12개가 왔을때.
            
            1.
            last_context_task_time와 시간비교.
            last_context_task_time은 "빈" currnet_chat_inputs에 첫원소를 넣을때만 업데이트한다. -> 최초 입력 들어온거 대비 patient이내엔 반드시 task로 레핑완료하기.

            2.1
            last_context_task_time와 현재 시간 간격이 patient 이내이면, 바로 ChatTask 생성하지 않고, currnet_chat_inputs 에  {user_id : msg}를 append하기,
        

            3.
            currnet_chat_inputs의 길이가 max_process_num을 초과하거나, last_context_task_time와 현재 시간간격이 5초 초과일시, Task를 생성한다.
            context_process_queue에 현재 생성한 C

        '''

        now = time.time()
        item = msg   # 수정부분.


        # 1. 최초 입력 or 큐 비어있는 상태라면 last_chat_task_time 갱신
        if not self.current_chat_inputs:
            self.last_chat_task_time = now

        self.current_chat_inputs.append(item)

        # 2. 아직 묶지 않고 대기(입력이 max_process_num 미만이거나, patient초 이내면)
        if (len(self.current_chat_inputs) < self.max_process_num) and ((now - self.last_chat_task_time) < self.chat_patient):
            return  # 아직 Task 생성 X, 입력만 누적

        # 3. max_process_num개 도달 or 대기시간 초과 → Task 생성해서 큐에 집어넣음
        chat_task = ChatTask(list(self.current_chat_inputs))
        self.chat_process_queue.append(chat_task)
        self.current_chat_inputs.clear()
        self.last_chat_task_time = None


##################################################
# task_manager.py 수정안. 파라미터에 session_id추가
##################################################
    def create_context_task(self, user_id, docs_path, session_id) -> None:
        ''' 
        # case1. 
        ## patient 초 안에 chat_task가 max_process_num이하의 context_task가 들어왔을때. 
        ### 예를들어, 30초안에 5개의 task를 받을수있는데, 3개만 왔을때.

        # case2.
        ## patient 초 안에 chat_task가 max_process_num초과의 context_task가 들어왔을때. 
        ### 예를들어, 30초안에 5개의 task를 받을수있는데, 12개가 왔을때.        
        '''
        now = time.time()
        item = {"user_id": user_id, "docs_path": docs_path, "session_id": session_id}
        if not self.current_context_inputs:
            self.last_context_task_time = now

        self.current_context_inputs.append(item)

        if (len(self.current_context_inputs) < self.max_process_num) and ((now - self.last_context_task_time) < self.context_patient):
            return

        context_task = ContextTask(list(self.current_context_inputs))
        self.context_process_queue.append(context_task)
        self.current_context_inputs.clear()
        self.last_context_task_time = None

    def flush_context_if_due(self) -> bool:
        now = time.time()
        if (
            self.current_context_inputs and
            self.last_context_task_time and
            (now - self.last_context_task_time > self.context_patient)
        ):
            task = ContextTask(list(self.current_context_inputs))
            self.context_process_queue.append(task)
            self.current_context_inputs.clear()
            self.last_context_task_time = None
            return True
        return False


    def flush_chat_if_due(self) -> bool:
        now = time.time()
        if (
            self.current_chat_inputs and
            self.last_chat_task_time and
            (now - self.last_chat_task_time > self.chat_patient)
        ):
            task = ChatTask(list(self.current_chat_inputs))
            self.chat_process_queue.append(task)
            self.current_chat_inputs.clear()
            self.last_chat_task_time = None
            return True
        return False



    def is_context_process_queue_available(self):
        '''
        현재는 단순히 큐가 empty유무인지 반환하면 된다.
        '''
        return bool(self.context_process_queue)


    def is_chat_process_queue_available(self):
        return bool(self.chat_process_queue)


    def get_chat_task(self) -> list[dict[str, str]]:
        '''
        현재는 단순 FIFO 프로토콜을 따르지만, 고도화에 따라서 복잡한 알고리즘에 따라서 처리할 Task를 반환할수있다.
        "app"에서 호출해서 쓸때는 그 프로토콜을 몰라도 완벽히 처리된, 즉시사용 가능한 task를 받아서 쓸수있게 해야한다.

        # input : None
        # return
            list[Dict[chat_id, str]]
        '''
        if self.chat_process_queue:
            chat_task_obj = self.chat_process_queue.popleft()
            return chat_task_obj.task
        else:
            return []
        
    
    def get_context_task(self) -> list[dict[str, str], dict[str, str]]:
        '''
        # input : None
        # return
            list[Dict["chat_id", chat_id], Dict["docs_path", docs_path]]
        
        
        '''
        if self.context_process_queue:
            context_task_obj = self.context_process_queue.popleft()
            return context_task_obj.task
        else:
            return []
    

'''
# app 객체에서 사용예시.
# 사용예시.
while app.task_manger.is_context_process_queue_available():
    chat_task = app.task_manger.get_chat_task()
    app.create_chats(chat_task)


'''