# 🎙️ SpeakNote: 강의 음성 기반 실시간 AI 주석 시스템 및 지연 최소화를 위한 병렬 처리와 통신 구조 설계

본 프로젝트는 강의 음성 인식(STT) 정보와 시각 자료(PDF)를 통합하여 문맥을 반영한 실시간 AI 주석을 생성하고, 다중 사용자 환경에서의 서비스 지연 최소화를 목적으로 병렬 처리 및 비동기 통신 구조를 설계 및 구현한 2025 전기 부산대학교 정보컴퓨터공학부 졸업과제입니다.

## 1. 프로젝트 배경

### 1.1. 국내외 시장 현황 및 문제점
기존 강의 및 회의 환경에서는 학습 효율성을 저해하는 다음과 같은 근본적인 문제가 지속적으로 제기되어 왔습니다.
1. **발화 속도와 필기 속도 간의 격차**: 강의자의 평균 발화 속도(분당 120∼180 단어)는 학습자의 일반적인 필기 속도(타이핑 약 33 단어/분, 필기 약 22 단어/분)를 상회하여, 핵심 정보의 누락이 빈번하게 발생합니다.

2. **분산된 학습 환경으로 인한 비효율성**: 학습자는 강의 자료(PDF) 열람 외에도, 별도의 STT 애플리케이션 및 검색 도구를 동시에 활용해야 하는 다중 도구 사용의 비효율성을 경험하고 있습니다.

3. **STT 결과의 비정제성 및 휘발성**: STT 결과는 불필요한 구어체 요소가 포함된 단편적인 형태로 제공되어 노트 필기나 심층 검색에 활용하기에 부적합하며, 발화 정보는 휘발성이 강하여 복원이 어렵다는 한계가 존재합니다.

4. **검색 증강 생성(RAG) 환경의 멀티모달 정보 처리 한계**: 기존 LLM 기반 RAG 환경은 주로 텍스트 데이터에 의존하는 경향이 있으며, 이로 인해 표, 차트, 수식 등 시각적 정보를 충분히 반영하지 못하여 답변의 정확성 확보에 어려움이 존재했습니다.

### 1.2. 필요성과 기대효과
본 과제는 통합적인 실시간 학습 보조 도구의 구축 필요성에 대한 인식에서 출발하였습니다.

- 강의 자료와 실시간 음성 인식을 단일 웹 인터페이스에 통합하여 사용자의 집중도 분산을 최소화하고, STT 결과를 문맥적 정제를 통해 학습 효율성을 극대화하는 통합 시스템의 구축이 필수적으로 요구됩니다. 특히, 다중 사용자의 동시 접속을 수용하기 위한 Low-Latency 시스템 아키텍처 설계가 핵심 과제입니다.
- **학습 효율 증대**: 학습자들은 강의 몰입도를 유지하면서도 자동 정제된 주석을 확보할 수 있으며, 이는 필기 속도와 정보 이해도 간의 격차를 해소하는 데 기여할 것으로 예상됩니다.
- **정확도 향상**: 문서에 포함된 시각 정보를 자연어 텍스트로 변환하여 RAG 프로세스에 활용함으로써, LLM의 환각 발생률을 저감하고 답변의 근거 및 신뢰성을 제고합니다.
- **운영 안정성 확보**: 세션별 독립적인 비동기 병렬 처리 구조와 작업 큐 관리 메커니즘을 통해 다중 사용자 환경에서도 안정적인 서비스 운영과 시스템 확장성을 확보할 수 있습니다.


## 2. 개발 목표

### 2.1. 목표 및 세부 내용
SpeakNote의 궁극적인 개발 목적은 실시간 음성 요약, 문서 기반 RAG, 주석 시각화 기능을 통합적으로 구현하고, 낮은 지연 및 높은 처리율을 달성하는 데 있습니다.

| 구분         | 주요 목표                          | 세부 구현 내용                                                                 |
|--------------|------------------------------------------|------------------------------------------------------------------------------------------|
| 통합 UI/UX   | **강의 자료와 주석의 통합 시각화**             | PDF 뷰어와 실시간 주석 패널의 2분할 레이아웃 제공                                         |
| 실시간 처리  | **STT 지연 최소화 및 다중 사용자 병렬 처리** | Session-Specific 아키텍처 (세션별 독립 STT 스트림) 및 비동기 작업 큐 (Task Manager) 구현 |
| AI 품질      | **문맥 보존형 주석 생성**                     | Corrective RAG (CRAG) 체인 기반의 자가 검증 노드를 통한 문서 적합도 판단 및 외부 웹 검색 연동 |
| 문서 처리    | **근거 보존형 멀티모달 전처리**              | UpstageDP 및 LLM을 활용하여 표, 차트, 수식 등 시각 정보를 자연어 텍스트로 변환 후 RAG 백터 DB에 저장 |
| 데이터 관리  | **주석 스냅샷 버전 관리 및 좌표 정합**         | MongoDB 기반의 주석 스냅샷 관리 및 정규화 좌표를 활용한 주석 조회 및 내보내기 기능 구현 |

### 2.2. 기존 서비스 대비 차별성
| 서비스 특징     | SpeakNote                                         | 기존 STT 앱 + 필기 앱                                      | 기존 RAG 서비스                                               |
|----------------|--------------------------------------------------|----------------------------------------------------------|--------------------------------------------------------------|
| UI/UX 통합     | 강의 자료와 주석을 단일 페이지에서 실시간 연동           | 최소 2~3개의 애플리케이션/창 전환 필요 (집중도 분산)     | 문서 기반 질의응답에 한정 (실시간 발화 처리 불가)              |
| 실시간성/확장성 | 세션별 독립적 비동기 병렬 처리 구조 설계 및 검증          | 단일 사용자 환경에 국한되거나 서버 부하에 취약                 | 실시간 스트리밍 기능 부재                                      |
| 멀티모달 RAG   | LLM 기반 시각 정보(차트, 수식) 변환 후 RAG 활용           | 텍스트 기반 STT 결과만 사용                                 | 단순 텍스트 문서 파싱만 의존                                   |
| 주석 품질      | CRAG(자가 검증) 체인으로 문서 적합도 판단 후 웹 검색 연동 | 단순 텍스트 변환 및 요약 기능 제공                          | 문서 내 정보만 활용하여 외부 정보 처리 불가                     |
| 데이터 정합성  | 좌표 변환 기반의 주석 포함 PDF 내보내기 (WYSIWYG 보장) | 해당 기능 미제공            | 해당 기능 미제공                                               |


### 2.3. 사회적 가치 도입 계획
- 정보 평등 기여: 필기 속도 및 청각 정보 처리 능력에 제약이 있는 학습자들에게 정제된 노트를 자동 제공하여 학습 환경의 접근성을 확대하고 정보 습득의 격차를 해소합니다.

- 지속 가능한 지식 관리: 휘발성을 가지는 강의 발화 내용을 구조화된 디지털 자산(주석 스냅샷) 형태로 영구 보존하고, 검색 가능하도록 제공하여 지식의 재활용성 및 장기적인 학습 효과를 증진합니다.

- 환경 보호: 기존 종이 노트 필기를 대체하는 디지털 솔루션을 제시함으로써 탄소 발자국 감소를 유도하고 친환경적인 학습 방식을 지원합니다.


## 3. 시스템 설계

### 3.1. 시스템 구성도
본 시스템은 애플리케이션 계층(Java), AI 처리 계층(Python), 그리고 프론트엔드(Next.js)로 구성된 모듈형 아키텍처를 채택하여 확장성 및 안정성을 확보하였습니다.

| 계층                  | 역할                                       | 주요 컴포넌트                                                                 |
|-----------------------|------------------------------------------|-------------------------------------------------------------------------------|
| Presentation          | 사용자 인터페이스, 오디오 캡쳐 및 주석 렌더링   | **Next.js**, React, Zustand, WebSocket Client                                  |
| Application Tier (Java) | 실시간 통신, 세션 관리, 데이터 중계 및 REST API | **Spring Boot**, WebSocket Handler, **Google STT (gRPC)**                      |
| AI Tier (Python)      | 문서 전처리, RAG 기반 주석 생성, 병렬 작업 관리   | **FastAPI**, Task Manager, Document Parser (UpStageDP), LLM Agents (CRAG)     |
| Data & Storage        | 데이터 저장 및 파일 관리                        | **MySQL** (정형 데이터), **MongoDB** (주석 스냅샷/버전), File Storage (PDF 원본) |

```
추후 추가
```

### 3.2. 사용 기술

| 구분          | 기술 스택                                                                                                                                                 | 세부 사용 목적 및 이유                                                                                          |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| Frontend      | ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs) ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white) | 동적 UI 구현, SSR/CSR 혼합 환경 지원, 반응형 디자인 및 일관된 스타일링, 상태 관리 라이브러리(Zustand) 적용 |
| Backend (App) | ![Java](https://img.shields.io/badge/Java-007396?logo=openjdk&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=white) ![WebSocket](https://img.shields.io/badge/WebSocket-010101?logo=socket.io&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens) | 다중 사용자 세션 관리, 안정적인 실시간 통신 및 데이터 중계, RESTful API 구현 |
| Backend (AI)  | ![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white) ![Asyncio](https://img.shields.io/badge/Asyncio-000000?logo=python&logoColor=white) | AI 연산 최적화, 비동기 병렬 처리 및 작업 큐 규현, LLM 에이전트 오케스트레이션 수행 |
| Database      | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white) | 정형 데이터(사용자, 파일 메타) 관리, 비정형 데이터(주석 스냅샷, 버전) 관리 및 효율적인 쿼리 지원 |
| AI     | ![Google STT](https://img.shields.io/badge/Google%20STT-4285F4?logo=google&logoColor=white) ![UpStage](https://img.shields.io/badge/UpStageDP-FF6F00?logo=openai&logoColor=white) ![LangChain](https://img.shields.io/badge/LangChain-121212?logo=openai&logoColor=white) ![Corrective RAG](https://img.shields.io/badge/Corrective%20RAG-6A1B9A?logo=chainlink&logoColor=white) | 고품질 실시간 음성 인식, 멀티모달 문서 파싱, 복합 AI 답변 체인 설계 |
| Infra         | ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white) ![AWS VPC](https://img.shields.io/badge/AWS%20VPC-FF9900?logo=amazonaws&logoColor=white) ![EC2](https://img.shields.io/badge/AWS%20EC2-FF9900?logo=amazonaws&logoColor=white) | 배포 환경 컨테이너화, 모듈 간 네트워크 격리 및 운영 확장성 확보 |



## 4. 개발 결과

### 4.1. 전체 시스템 흐름도
SpeakNote는 STT 처리 (Java) 및 주석 생성 (Python)의 두 가지 핵심 파이프라인으로 구성되어 있습니다.

| 단계             | 설명                                                                                                                                   | 구현 기술 및 특징                                                                 |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| 1. 오디오 입력   | 클라이언트 브라우저에서 PCM 오디오 청크를 WebSocket 프로토콜을 이용하여 실시간으로 전송합니다.                           | WebSocket, Web Audio API                                                         |
| 2. 실시간 STT    | Java 서버는 수신된 청크를 세션별 전용 STT 스트림으로 gRPC 전송하여 텍스트 변환을 수행합니다.                                           | **Java Spring Boot**, **Google STT (gRPC)**, 세션 독립적 처리                     |
| 3. 문맥 축적 및 로직 | STT 변환 결과 텍스트를 **SttTextBuffer**에 누적하고, 페이지 전환, 침묵 구간, 분량 임계치를 기준으로 주석 생성을 위한 트리거를 발생시킵니다. | **Java SessionState**, 지역 화상 정렬 메모리 플레이스 전략                         |
| 4. AI Task 전송  | 트리거된 요청은 Python 서버의 **Task Manager**로 전송되며, 해당 요청은 **MAX_PROCESS_NUM** 및 **Patient Time**을 기준으로 묶여 작업 큐에 비동기적으로 등록됩니다. | **Python FastAPI**, Task Manager (병렬 처리 제어)                                 |
| 5. CRAG 주석 생성 | Python 서버는 **Corrective RAG** 에이전트를 실행하여 Query 정제, 문서 적합도 평가를 거쳐 적합도에 따라 (Yes: 문서 기반 답변 / No: 웹 검색 기반 답변)을 도출합니다. | **CRAG**, LLM Agents, UpStage DP                                                  |
| 6. 결과 전송     | 최종 생성된 주석 결과는 Java 서버의 **Outbound Queue**에 적재된 후, WebSocket을 통해 사용자 브라우저로 실시간 푸시됩니다.              | **Java OutboundQueue**, WebSocket                                                 |

```
추후 추가
```

### 4.2. 기능 설명 및 주요 기능 명세서
| 기능 명              | 입력 (Input)                           | 출력 (Output)                          | 상세 설명 및 특징                                                                                                                                                     |
|----------------------|----------------------------------------|----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 실시간 STT           | 마이크 음성 (PCM 청크)                 | 실시간 인식 텍스트                      | 2개 스레드(캡쳐+처리) 및 유한 버퍼(**Drop Oldest**) 최적화 정책을 적용하여 평균 ASL 0.6초 이내 달성을 입증했습니다.                                                      |
| PDF 주석 내보내기    | PDF 원본, 주석 좌표 및 크기, 텍스트     | 주석이 오버레이된 **Annotated PDF 파일** | 화면 좌표를 정규화 좌표 (0 ~ 1)로 변환 후 PDF 좌표로 복원하며, WYSIWYG(보는 대로 출력)을 보장합니다. 한글 폰트 임베딩을 지원합니다.                           |
| 멀티모달 전처리      | PDF 파일 경로                          | 벡터 DB에 저장된 자연어 텍스트 컨텐츠    | **UpStageDP**를 활용하여 시각 정보를 추출하고, **LLM Category Handler**를 통해 표, 차트, 수식 등을 멀티모달 가능한 텍스트로 변환합니다. (비동기 병렬 처리)              |
| CRAG 주석 생성       | STT 정제 텍스트, 문서 컨텐츠           | 최종 주석 텍스트, 문서 적합성 평가 결과  | **Grade_documents** 노드를 통해 문서와 발화 내용의 적합성을 평가합니다. 적합하지 않을 시 웹 검색으로 전환하여 답변 품질 및 범위를 확장합니다.                           |
| 다중 사용자 병렬 처리 | 다수 유저의 주석 생성 요청 (Task)       | 지연 최소화된 주석 결과                 | **Task Manager**가 요청을 **Task 객체**로 묶어 작업 큐에 관리하며, 처리 응답 이후 매 3초 간격으로 답변을 처리 가능하도록 설계되었습니다.                                 |
| 주석 배치/관리       | 주석 D&D (드래그앤드롭), 주석 ID, `pageNumber`, 정규화 좌표 (0 ~ 1) | 주석 ID, pageNumber, 좌표               | 생성된 주석을 PDF 슬라이드 위에 배치하여 시각적으로 통합하고, **MongoDB**에 버전별 스냅샷으로 저장하여 데이터 무결성을 유지합니다.                                     |


### 4.3. 디렉토리 구조
```
Capstone-2025-team-19/
├── ai/                          # AI 서버 (Python FastAPI)
│   ├── speak_note/             # AI 핵심 모듈
│   │   ├── engine/             # AI 엔진
│   │   ├── instance/           # 인스턴스 관리
│   │   ├── manager/            # 매니저 클래스들
│   │   ├── prompts/            # 프롬프트 템플릿
│   │   ├── tools/              # AI 도구들
│   │   └── work_flows/         # RAG 워크플로우
│   ├── data/                   # 데이터 저장소
│   ├── json_formmat/           # JSON 포맷팅
│   ├── server.py               # 메인 서버 파일
│   └── requirements.txt        # Python 의존성
├── backend/                    # 백엔드 서버 (Java Spring Boot)
│   ├── src/main/java/org/example/speaknotebackend/
│   │   ├── client/             # 외부 클라이언트
│   │   ├── config/             # 설정 클래스들
│   │   ├── controller/         # REST API 컨트롤러
│   │   ├── domain/             # 도메인 로직
│   │   ├── dto/                # 데이터 전송 객체
│   │   ├── entity/             # JPA 엔티티
│   │   ├── global/             # 전역 설정
│   │   ├── mongo/              # MongoDB 관련
│   │   ├── service/            # 비즈니스 로직
│   │   └── websocket/          # WebSocket 핸들러
│   ├── src/main/resources/     # 설정 파일들
│   ├── build.gradle            # Gradle 빌드 설정
│   └── Dockerfile              # Docker 설정
├── frontend/                   # 프론트엔드 (Next.js)
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── api/            # API 라우트
│   │   │   ├── auth/           # 인증 페이지
│   │   │   ├── dashboard/      # 대시보드
│   │   │   └── folders/        # 폴더 관리
│   │   ├── components/         # React 컴포넌트
│   │   ├── lib/                # 유틸리티 함수
│   │   └── stores/             # 상태 관리
│   ├── public/                 # 정적 파일
│   ├── package.json            # Node.js 의존성
│   └── tailwind.config.js      # Tailwind CSS 설정
├── docs/                       # 문서
│   ├── 01.보고서/              # 프로젝트 보고서
│   ├── 02.포스터/              # 포스터
│   └── 03.발표자료/            # 발표 자료
├── .gitignore                  # Git 무시 파일
├── README.md                   # 프로젝트 설명
└── install_and_build.sh       # 설치 및 빌드 스크립트
```

### 4.4. 산업체 멘토링 의견 및 반영 사항
```
추후 추가
```

## 5. 설치 및 실행 방법
SpeakNote는 Java Spring Boot, Python FastAPI, Next.js로 구성된 세 가지 독립 서버의 동시 실행을 요구하며, Google STT, UpStage API 키 등의 설정이 필수적입니다. 통합된 실행을 위해 Docker Compose 활용을 권장합니다.

1. 환경 변수 설정
<details>
<summary>Java Backend (예시)</summary>
  
```env
# ===================== 기본 설정 =====================
SPRING_APPLICATION_NAME=speaknote-backend
SERVER_ADDRESS=0.0.0.0
SERVER_PORT=8080
LOGGING_LEVEL=INFO

# ===================== STT 설정 =====================
STT_QUEUE_INBOUND_CAPACITY=6
STT_QUEUE_OUTBOUND_CAPACITY=6
GOOGLE_APPLICATION_CREDENTIALS=src/main/resources/stt-credentials.json
GOOGLE_STT_CREDENTIALS_PATH=src/main/resources/stt-credentials.json

# ===================== CORS 설정 =====================
CORS_ALLOWED_ORIGIN=http://localhost:3000
MULTIPART_MAX_FILE_SIZE=20MB
MULTIPART_MAX_REQUEST_SIZE=20MB

# ===================== AI 서버 설정 =====================
AI_SERVER_URL=http://localhost:8000/text
PDF_ALLOWED_ORIGIN=http://localhost:8000/pdf
PDF_FILE_DIR=./uploads

# ===================== Python API 설정 =====================
PYTHON_API_BASE_URL=http://localhost:8000
PYTHON_API_TIMEOUT_MS=5000

# ===================== 데이터베이스 설정 =====================
# MySQL
DB_URL=jdbc:mysql://localhost:3306/speaknote?useSSL=true&serverTimezone=Asia/Seoul
DB_NAME=speaknote
DB_USERNAME=speak_user
DB_PASSWORD=speaknow
DB_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver

# MongoDB
MONGODB_URI=mongodb://localhost:27017/speaknote


# ===================== JPA 설정 =====================
JPA_HIBERNATE_DDL_AUTO=validate
JPA_SHOW_SQL=false
JPA_FORMAT_SQL=false

# ===================== JWT 설정 =====================
JWT_SECRET_KEY=

# ===================== Google OAuth2 설정 =====================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# ===================== Jackson 설정 =====================
JACKSON_WRITE_DATES_AS_TIMESTAMPS=false

# ===================== Docker 설정 =====================
SPRING_DOCKER_COMPOSE_ENABLED=false
```
</details>

<details>
<summary>Python Backend (예시)</summary>
  
```env
UPSTAGE_API_KEY=
TAVILY_API_KEY=
OPENAI_API_KEY=
LANGCHAIN_TRACING_V2="false"
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=myRAG
UPLOAD_FOLDER="./data"
PORT_NUM=8000
JAVA_SERVER_URL=http://localhost:8080
```
</details>

<details>
<summary>Frontend (예시)</summary>
  
```env
# 백엔드 API 설정
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# WebSocket 설정
NEXT_PUBLIC_API_WSS_URL=ws://localhost:8080/ws/audio

# Google OAuth 설정
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
```
</details>


2. Docker를 이용한 통합 실행 (권장)

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 3개의 서비스(Java, Python, Next.js)를 동시에 빌드하고 실행합니다.
```
예슬 작성
```

3. 개별 서버 실행
### 5.1. 설치절차 및 실행 방법
```bash
# Frontend
cd frontend
npm install
npm run dev   # http://localhost:3000

# Backend
cd backend
./gradlew bootRun  # http://localhost:8080

# AI Server
cd ai-server
pip install -r requirements.txt
python server.py   # http://localhost:8000
```
접속 주소: http://localhost:3000

### 5.2. 오류 발생 시 해결 방법
- **DB 연결 오류** → MySQL DB 및 MongoDB 데이터베이스 생성 및 사용자 권한 부여
- **STT API 제한** → Google Cloud Console에서 API Key 발급

---

## 6. 소개 자료 및 시연 영상

### 6.1. 프로젝트 소개 자료
```
추후 추가
```

### 6.2. 시연 영상
[[2025 전기 졸업과제] 드레스코딩 팀 소개 영상](https://www.youtube.com/watch?v=CNCycpolmgY)


## 7. 팀 구성

### 7.1. 팀원별 소개 및 역할 분담
| 이름 | 역할 및 기여 |
|------|--------------|
| **김동인** | - 팀장 역할 수행, 프로젝트 일정 총괄 및 성공적 마무리<br>- 전체 서비스 UI/UX 디자인 및 개발<br>- 관계형 데이터베이스 설계 및 구축<br>- Java SpringBoot 서버 & Google STT 연동<br>- 다중 사용자 고려한 Java 아키텍처 설계<br>- 실시간 STT 시스템 지연 시간 최적화 실험 수행 |
| **김예슬** | - 주석 드래그앤드롭, 편집·삭제, 히스토리 저장, PDF 다운 등 핵심 주석 시스템 개발<br>- 비관계형 데이터베이스 설계 및 구축<br>- 파일 시스템 설계 및 구축<br>- 인프라 및 배포 환경 구현 |
| **정유성** | - FastAPI 서버 구축<br>- 문서 전처리 구현<br>- 생성형 AI 기반 주석 생성 모듈 구현<br>- 문서/주석 생성 작업 비동기·병렬 처리 및 작업 큐 구현<br>- 다중 사용자 고려한 Python 아키텍처 설계 |


### 7.2. 팀원 별 참여 후기
```
추후 추가
```


## 8. 참고 문헌 및 출처

1. S.-Q. Yan, J.-C. Gu, Y. Zhu, and Z.-H. Ling, *"Corrective Retrieval Augmented Generation,"* arXiv preprint arXiv:2401.15884, 2024. [Online]. Available: [https://arxiv.org/abs/2401.15884](https://arxiv.org/abs/2401.15884)

2. A. Asai, Z. Wu, Y. Wang, A. Sil, and H. Hajishirzi, *"Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection,"* arXiv preprint arXiv:2310.11511, 2023. [Online]. Available: [https://arxiv.org/abs/2310.11511](https://arxiv.org/abs/2310.11511)

3. T. Hwang, S. Cho, S. Jeong, H. Song, S. Han, and J. C. Park, *"EXIT: Context-Aware Extractive Compression for Enhancing Retrieval-Augmented Generation,"* arXiv preprint arXiv:2412.12559, 2024. [Online]. Available: [https://arxiv.org/abs/2412.12559](https://arxiv.org/abs/2412.12559)

4. S. Papi, P. Wang, J. Chen, J. Xue, J. Li, and Y. Gaur, *"Token-Level Serialized Output Training for Joint Streaming ASR and ST Leveraging Textual Alignments,"* arXiv preprint arXiv:2307.03354, 2023. [Online]. Available: [https://arxiv.org/abs/2307.03354](https://arxiv.org/abs/2307.03354)

5. O. Weller, M. Sperber, C. Gollan, J. Klüver, and M. Nussbaum-Thom, *"Streaming Models for Joint Speech Recognition and Translation,"* arXiv preprint arXiv:2101.09149, 2021. [Online]. Available: [https://arxiv.org/abs/2101.09149](https://arxiv.org/abs/2101.09149)

6. A. Tripathi, J. Kim, Q. Zhang, H. Lu, and H. Sak, *"Transformer Transducer: One Model Unifying Streaming and Non-Streaming Speech Recognition,"* arXiv preprint arXiv:2010.03192, 2020. [Online]. Available: [https://arxiv.org/abs/2010.03192](https://arxiv.org/abs/2010.03192)

7. Q. Liu and X. Sun, *"Research of Web Real-Time Communication Based on Web Socket,"* Int. J. Communications, Network and System Sciences, Vol. 5, No. 12, pp. 797-801, 2012. [WEB Site]

---

1. LangChain, *"Corrective RAG (CRAG),"* [Online]. Available: [https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_crag/](https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_crag/) (accessed: Sep. 17, 2025)

2. Google Cloud, *"Detect text in images (OCR),"* [Online]. Available: [https://cloud.google.com/vision/docs/ocr](https://cloud.google.com/vision/docs/ocr) (accessed: Sep. 17, 2025)

3. IBM, *"What is embedding?"* [Online]. Available: [https://www.ibm.com/think/topics/embedding](https://www.ibm.com/think/topics/embedding) (accessed: Sep. 17, 2025)

4. Univ. of Illinois Chicago, *"Why do students struggle with note taking,"* [Online]. Available: [https://teaching.uic.edu/cate-teaching-guides/inclusive-equity-minded-teaching-practices/note-taking](https://teaching.uic.edu/cate-teaching-guides/inclusive-equity-minded-teaching-practices/note-taking)

