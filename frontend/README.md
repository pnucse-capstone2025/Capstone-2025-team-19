# SpeakNote Frontend

SpeakNote의 프론트엔드 프로젝트입니다.  
절대 !! `npm audit fix --force` 를 하지 말 것. 경고가 떠도 그냥 놔두기.  
이거 실행하면 바로 의존성 에러 납니다..

## 기술 스택

- Next.js 15.3.2
- React 19
- TypeScript
- TailwindCSS
- Google OAuth 2.0 (직접 구현)
- PDF 관련 라이브러리 (pdf-lib, react-pdf, jspdf)

## 시작하기

### 필수 요구사항

- Node.js (최신 LTS 버전 권장)
- npm

### 설치 및 실행

1. 레포지토리 클론

```bash
git clone [레포지토리 URL]
cd front
```

2. 의존성 패키지 설치

```bash
npm install --legacy-peer-deps
```

> Note: React 19와 일부 라이브러리 간의 의존성 충돌로 인해 `--legacy-peer-deps` 옵션이 필요합니다.

3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API 설정
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Google OAuth 설정
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

> Note: Google OAuth 설정을 위해서는 Google Cloud Console에서 OAuth 2.0 클라이언트 ID를 생성해야 합니다.

4. 개발 서버 실행

```bash
npm run dev
```

5. 브라우저에서 확인

- http://localhost:3000 으로 접속

## 문제 해결

### canvas 모듈 관련 에러

PDF.js가 서버 사이드에서 PDF를 처리할 때 필요한 `canvas` 모듈이 이미 프로젝트에 포함되어 있습니다. 별도의 설치가 필요하지 않습니다.

### 의존성 충돌

React 19와 일부 라이브러리 간의 의존성 충돌이 있을 수 있습니다. 이는 `--legacy-peer-deps` 옵션을 사용하여 해결할 수 있습니다.

### Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보" 메뉴로 이동
4. "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID" 선택
5. 애플리케이션 유형을 "웹 애플리케이션"으로 설정
6. 승인된 리디렉션 URI에 `http://localhost:3000/api/auth/callback/google` 추가
7. 생성된 클라이언트 ID를 `.env.local` 파일의 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`에 설정
