from speak_note.manager.manager import Manager
from speak_note.instance.chat import Chat
from speak_note.instance.message import Message
import asyncio
import time

class ChatManager(Manager):
    def __init__(self):
        super().__init__()

    def create_chat(self, user_id, context, chat_id=None):
        chat = Chat(user_id=user_id, context=context)
        if chat_id is not None:   # 외부에서 chat_id를 지정해줬으면 덮어씌움
            chat.id = chat_id
        self.create_instance(chat)
        return chat


    def find_chat(self, chat_id):
        # id로 chat 객체 조회
        for inst in self.instances:
            if isinstance(inst, Chat) and inst.id == chat_id:
                return inst
        return None

    async def _ainvoke_chat(self, chat: Chat, msg: str):
        """
        실제 채팅 비동기 호출
        반환: dict(GraphState)
        """
        reps = await chat.ainvoke(chat.id, msg=msg)
        return reps

    async def multiple_chat_invoke(self, messages):
        """
        messages: list[Message]
        각 Message에 대해 Chat 실행
        return: list[dict(GraphState)]
        """
        start_time = time.time()
        async_tasks = []

        for msg in messages:
            chat = self.find_chat(msg.chat_id)
            if chat is not None:
                q = msg.contents.get("question")
                async_tasks.append(self._ainvoke_chat(chat, q))
            else:
                # chat_id 못찾은 경우 dict 반환
                async_tasks.append({
                    "question": msg.contents.get("question"),
                    "generation": None,
                    "error": "chat_not_found",
                    "documents": [],
                    "web_search": None
                })

        results = await asyncio.gather(*async_tasks)
        print(f"전체 {len(messages)}개의 채팅 메시지 처리 시간: {time.time() - start_time:.2f}초")
        
        return results
