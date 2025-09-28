import os
import httpx
from dotenv import load_dotenv

# .env 파일 읽어오기
load_dotenv()
# =====================
# 자바 서버 콜백 설정
# =====================
JAVA_BASE_URL = os.getenv("JAVA_SERVER_URL")  # 실제 자바 서버 주소로 교체 or 환경변수로 관리

async def send_callback(endpoint: str, payload: dict):
    """
    자바 서버로 콜백을 보내는 공용 함수.
    - endpoint: "/callbacks/contexts" 또는 "/callbacks/annotations"
    - payload: 기존 server.py에서 정의된 JSON 스펙과 동일
    """
    url = f"{JAVA_BASE_URL}{endpoint}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            print(f"[Callback 성공] {url}, status={response.status_code}")
        except Exception as e:
            print(f"[Callback 실패] {url}, error={e}")

