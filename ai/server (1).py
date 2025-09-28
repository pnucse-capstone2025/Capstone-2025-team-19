import os
import asyncio
import threading
import uvicorn
from dotenv import load_dotenv

from datetime import datetime
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---- 앱 내부 의존성 ----
from speak_note.engine.app import App
from speak_note.instance.message import Message

# ===================== 앱/서버 초기화 =====================
app_backend = App()  # 비즈니스 로직 처리 앱
app = FastAPI(title="SpeakNote Backend", version="0.1.0")

# (필요 시) CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포 시 제한 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER")
PORT_NUM = os.getenv("PORT_NUM")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ===================== 백그라운드 워커 =====================
def start_chat_worker():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    print("[ChatWorker] 시작됨")
    try:
        loop.run_until_complete(app_backend.chats_background_worker())
    finally:
        loop.close()

def start_docs_worker():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    print("[DocsWorker] 시작됨")
    try:
        loop.run_until_complete(app_backend.docs_background_worker())
    finally:
        loop.close()

# FastAPI startup 이벤트에 워커 등록
@app.on_event("startup")
async def startup_event():
    threading.Thread(target=start_chat_worker, daemon=True).start()
    threading.Thread(target=start_docs_worker, daemon=True).start()
    print("[startup_event] Background workers started")

# ===================== 모델 정의 =====================
class TextRequest(BaseModel):
    userId: str
    sessionId: str
    seq: int
    text: str
    lang: Optional[str] = "ko-KR"
    requestId: Optional[str] = None
    chatId: Optional[str] = None


class ContextRequest(BaseModel):
    userId: str
    sessionId: str
    fileId: str
    lang: Optional[str] = "ko-KR"


# ===================== 유틸 함수 =====================
async def _process_message_one(msg: Message):
    try:
        results = await app_backend.chat_manager.multiple_chat_invoke([msg])
        if results and isinstance(results, list):
            msg.get_annotation(results[0])
    except Exception as e:
        msg.audio_text = msg.contents.get("question")
        msg.annotation = f"[ERROR] {type(e).__name__}: {e}"
        msg.finished = True


def _save_upload_file(upload: UploadFile, save_dir: str) -> str:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    base = os.path.basename(upload.filename) if upload.filename else "uploaded.pdf"
    save_name = f"{ts}_{base}"
    save_path = os.path.join(save_dir, save_name)
    with open(save_path, "wb") as f:
        f.write(upload.file.read())
    return save_path


# ===================== 라우트 =====================

@app.post("/pdf")
async def handle_pdf(
    file: UploadFile = File(...),
    userId: str = Form(...),
    fileId: Optional[str] = Form(None),
    session_id: str = Form(...)
):
    user = app_backend.user_manager.find_instance(userId)
    if user is None:
        user = app_backend.user_manager.create_user(user_id=userId)

    try:
        saved_path = _save_upload_file(file, UPLOAD_FOLDER)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 저장 실패: {e}")

    try:
        app_backend.task_manager.create_context_task(
            user_id=user.id, docs_path=saved_path, session_id=session_id
        )
        print(f"[PDF] ContextTask 등록됨: user={userId}, session={session_id}, path={saved_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"컨텍스트 작업 등록 실패: {e}")

    return JSONResponse(
        {
            "ok": True,
            "userId": userId,
            "fileId": fileId,
            "sessionID": session_id,
        },
        status_code=200,
    )


@app.post("/callbacks/contexts")
async def handle_context():
    outputs = []
    while app_backend.context_output_list:
        outputs.append(app_backend.context_output_list.pop())

    total_num = len(outputs)
    if total_num == 0:
        return Response(status_code=204)

    result = {
        "totalNum": total_num,
        "contexts": outputs,
    }
    return JSONResponse(result, status_code=200)



@app.post("/text")
async def handle_text(body: TextRequest):
    user = app_backend.user_manager.find_instance(body.userId)
    if user is None:
        user = app_backend.user_manager.create_user(user_id=body.userId)

    if body.chatId:
        chat_id = body.chatId
    else:
        if not getattr(user, "chats", None):
            raise HTTPException(status_code=400, detail="해당 유저의 Chat이 없습니다. /pdf 업로드로 컨텍스트부터 생성하세요.")
        chat_id = user.chats[-1].id

    msg = Message(user_id=user.id, chat_id=chat_id)
    msg.get_request(body.dict())
    app_backend.message_manager.create_instance(msg)

    asyncio.create_task(_process_message_one(msg))

    return JSONResponse(
        {
            "success": True,
            "status": "queued",
            "jobId": msg.id,
            "sessionId": body.sessionId,
            "seq": body.seq,
        },
        status_code=202,
    )


@app.post("/callbacks/annotations")
async def push_back():
    result = app_backend.message_manager.pop_all_finished()
    total = result.get("totalNum", 0)
    if total == 0:
        return Response(status_code=204)
    return JSONResponse(result, status_code=200)


# ===================== 개발용 실행 =====================
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
