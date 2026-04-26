# EduQuest Frontend

EduQuest의 프론트엔드 애플리케이션입니다.  
Vue 3, TypeScript, Vite 기반으로 구성되어 있으며, 학습 게임, 커뮤니티, 오답노트, 마이페이지 흐름을 제공합니다.

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Vue Router
- Axios
- Tailwind CSS
- Docker
- Nginx

## Requirements

- Node.js 20 이상
- npm
- Docker Desktop (도커 실행 시)

## Local Development

1. 의존성 설치

```bash
npm install
```

2. 환경 변수 설정  
프로젝트 루트에 `.env` 파일을 만들고 API 주소를 지정합니다.

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

기본값은 `http://localhost:8080/api/v1`이며, 환경 변수를 지정하지 않으면 이 값을 사용합니다.

3. 개발 서버 실행

```bash
npm run dev
```

기본 개발 주소:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Frontend Features

- 인증 상태를 로컬 스토리지 기반으로 복원
- 액세스 토큰 만료 시 refresh 요청으로 재시도
- 로그인 사용자 / 비로그인 사용자 / 관리자 권한 라우팅 분기
- 학습, 진행도, 커뮤니티, 북마크, 오답노트, 마이페이지 화면 구성
- API 모듈 분리를 통한 기능별 요청 관리

## Main Routes

- `/` : 랜딩 페이지
- `/login` : 로그인
- `/signup` : 회원가입
- `/home` : 홈
- `/game` : 학습 게임
- `/progress` : 학습 진행도
- `/community` : 커뮤니티
- `/bookmark` : 북마크
- `/incorrect-note` : 오답노트
- `/review` : 복습
- `/mypage` : 마이페이지
- `/notice` : 공지 페이지
- `/admin` : 관리자 페이지

## Project Structure

```text
src/
  api/          API 요청 모듈
  assets/       이미지 및 정적 리소스
  components/   공통 UI 컴포넌트
  pages/        페이지 컴포넌트
  router/       라우터 설정
  store/        인증 상태 저장소
  types/        타입 정의
  utils/        JWT 등 유틸리티
  App.vue       루트 컴포넌트
  main.ts       앱 진입점
```

## API Integration Notes

- Axios 인스턴스는 `src/api/axios.ts`에서 관리합니다.
- 기본 API 주소는 `VITE_API_BASE_URL`을 사용합니다.
- 요청 시 `localStorage`의 `accessToken`을 자동으로 Authorization 헤더에 붙입니다.
- `401` 응답이 오면 `/auth/refresh`로 토큰 재발급을 시도합니다.

## Authentication Flow

- 인증 상태는 `src/store/auth.ts`에서 관리합니다.
- 앱 시작 시 저장된 토큰으로 사용자 정보를 복원합니다.
- 저장된 토큰이 유효하지 않으면 refresh를 시도합니다.
- 인증 복원에 실패하면 로그인 화면으로 이동합니다.
- 미리보기용 preview 모드 세션도 지원합니다.

## Docker Build

이미지 빌드:

```bash
docker build -t eduquest-frontend:latest .
```

컨테이너 실행:

```bash
docker run -d -p 8080:80 --name eduquest-frontend eduquest-frontend:latest
```

브라우저 접속:

```text
http://localhost:8080
```

## Docker Notes

- 멀티 스테이지 빌드를 사용합니다.
- 빌드 단계에서는 Node.js 20 Alpine 이미지를 사용합니다.
- 배포 단계에서는 Nginx Alpine 이미지를 사용합니다.
- SPA 라우팅을 위해 `nginx.conf`에서 `try_files ... /index.html` 설정이 적용되어 있습니다.

## Build Output

프로덕션 빌드 파일은 `dist/`에 생성됩니다.

```bash
npm run build
```

## Repository Notes

- 현재 문서는 프론트엔드 프로젝트 기준으로만 정리되어 있습니다.
- 백엔드 API 상세 명세, DB 구조, 인프라 문서는 별도 저장소 또는 별도 문서에서 관리하는 것을 권장합니다.
