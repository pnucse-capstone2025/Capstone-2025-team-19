# 🚀 설치 가이드 (Installation Guide)

## 1. 프로젝트 클론
```bash
git clone https://github.com/2025-AI-SW-Hackathon/ai-backend.git
cd ai-backend
```

## 2. (선택) Conda 가상환경 생성
권장: 프로젝트별 가상환경을 생성하면 라이브러리 충돌을 방지할 수 있습니다.
```bash
conda create -n ai-backend python=3.11.9
conda activate ai-backend
```

## 3. 필수 라이브러리 설치
```bash
pip install -r requirements.txt
```

## 4. 환경 변수 설정
.env 파일을 프로젝트 루트 경로에 생성 후, 아래 예시를 참고해 API 키를 입력하세요.
```env
UPSTAGE_API_KEY=
TAVILY_API_KEY=
OPENAI_API_KEY=
LANGCHAIN_TRACING_V2=
LANGCHAIN_ENDPOINT=
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=
```

## 5. 서버 실행
```python
python server.py
```
