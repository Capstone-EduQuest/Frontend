EduQuest Frontend
파이썬 교육 게임 플랫폼 EduQuest의 프론트엔드 애플리케이션입니다.

이 문서는 프로젝트 설정, 실행 방법, Docker 배포 및 API 연동 정보를 포함하도록 업데이트되었습니다.

🚀 기술 스택
Frontend: Vue 3 + TypeScript + Vite
Styling: Tailwind CSS
State Management: Reactive Auth Store
HTTP Client: Axios
Routing: Vue Router
Build Tool: Vite
Container: Docker + Nginx
📋 사전 요구사항
Node.js 20+
Docker Desktop
npm 또는 yarn
🛠️ 로컬 개발 환경 설정
1. 의존성 설치
npm install
2. 환경변수 설정
.env 파일을 생성하고 백엔드 API URL을 설정하세요:

VITE_API_BASE_URL=http://localhost:8080/api/v1
3. 개발 서버 실행
npm run dev
브라우저에서 http://localhost:5173으로 접속하세요.

🐳 Docker 배포
Docker 이미지 빌드
# 프로젝트 루트에서 실행
docker build -t eduquest-frontend .
컨테이너 실행
# 포트 8080으로 실행
docker run -d -p 8080:80 --name eduquest-app eduquest-frontend

# 다른 포트로 실행 (예: 3000)
docker run -d -p 3000:80 --name eduquest-app eduquest-frontend
컨테이너 관리 명령어
# 실행 중인 컨테이너 확인
docker ps

# 컨테이너 로그 확인
docker logs eduquest-app

# 컨테이너 중지
docker stop eduquest-app

# 컨테이너 재시작
docker start eduquest-app

# 컨테이너 삭제
docker rm eduquest-app

# 이미지 삭제
docker rmi eduquest-frontend
🔧 환경변수 설정
백엔드 API URL 변경
코드를 수정하지 않고도 백엔드 환경을 변경할 수 있습니다:

개발 환경: .env 파일 생성

VITE_API_BASE_URL=http://localhost:8080/api/v1
프로덕션 환경: Docker 컨테이너 실행 시 환경변수 설정

docker run -d -p 8080:80 \
  -e VITE_API_BASE_URL=https://api.eduquest.com/api/v1 \
  --name eduquest-app \
  eduquest-frontend
Docker Compose 사용 시:

version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_API_BASE_URL=https://api.eduquest.com/api/v1
📁 프로젝트 구조
src/
├── api/                    # API 연동 모듈
│   ├── auth.ts            # 인증 (로그인, 회원가입, 토큰 갱신)
│   ├── learning.ts        # 학습 (스테이지, 문제, 제출, 힌트)
│   ├── community.ts       # 커뮤니티 (글, 댓글)
│   ├── bookmark.ts        # 북마크
│   ├── wallet.ts          # 지갑/포인트 관리
│   ├── wrong_note.ts      # 오답 노트 (AI 설명 포함)
│   ├── note.ts            # 사용자 노트
│   ├── reward.ts          # 학습 보상
│   └── axios.ts           # Axios 인스턴스 및 인터셉터
├── components/            # 재사용 가능한 컴포넌트
│   ├── CodeProblem.vue    # 코딩 문제 표시
│   └── PageHeader.vue     # 공통 페이지 헤더
├── pages/                 # 페이지 컴포넌트
│   ├── HomePage.vue       # 메인 페이지
│   ├── LoginPage.vue      # 로그인 페이지
│   ├── Signup.vue         # 회원가입 페이지
│   ├── GamePage.vue       # 학습 페이지
│   ├── Progress.vue       # 진행상황 페이지
│   └── CommunityPage.vue  # 커뮤니티 페이지
├── router/                # Vue Router 설정
│   └── index.ts           # 라우터 정의
├── store/                 # 상태 관리
│   ├── auth.ts            # 인증 상태 (사용자, 토큰)
│   └── index.ts           # 스토어 export
├── assets/                # 정적 파일
├── App.vue                # 루트 컴포넌트
├── index.css              # 전역 스타일
└── main.ts                # 애플리케이션 진입점
🔗 API 연동
인증 (Authentication)
POST /auth/login - 로그인
POST /auth/register - 회원가입
POST /auth/refresh - 토큰 갱신
POST /auth/find-password - 비밀번호 찾기
POST /auth/reset-password - 비밀번호 재설정
학습 (Learning)
스테이지

GET /stages - 스테이지 목록 조회
GET /stages/{uuid} - 특정 스테이지 조회
POST /stages - 스테이지 생성 (관리자)
PUT /stages/{uuid} - 스테이지 수정 (관리자)
DELETE /stages/{uuid} - 스테이지 삭제 (관리자)
문제

GET /problems - 문제 목록 조회
GET /problems/{uuid} - 특정 문제 조회
GET /stages/{stageUuid}/problems - 스테이지별 문제 조회
POST /problems/{uuid}/submissions - 문제 풀이 제출
GET /problems/{uuid}/hints - 문제 힌트 목록 조회
GET /problems/{uuid}/hints/{level} - 특정 레벨 힌트 조회 (포인트 차감)
커뮤니티 (Community)
글

GET /community/posts - 커뮤니티 글 목록 조회
GET /community/posts/{uuid} - 특정 글 상세 조회
POST /community/posts - 글 작성
PUT /community/posts/{uuid} - 글 수정
DELETE /community/posts/{uuid} - 글 삭제
댓글

GET /community/posts/{postUuid}/answers - 댓글 목록 조회
POST /community/posts/{postUuid}/answers - 댓글 작성
PUT /community/answers/{uuid} - 댓글 수정
DELETE /community/answers/{uuid} - 댓글 삭제
POST /community/answers/{uuid}/adopt - 댓글 채택
북마크 (Bookmark)
GET /bookmarks - 북마크 목록 조회
POST /bookmarks - 북마크 추가
DELETE /bookmarks/{uuid} - 북마크 삭제
GET /bookmarks/check/{problemUuid} - 북마크 여부 확인
지갑 (Wallet)
GET /wallet - 사용자 지갑 조회
GET /wallet/balance - 포인트 잔액 조회
GET /wallet/history - 거래 내역 조회
오답 노트 (Wrong Note)
GET /wrong-notes - 오답 노트 목록 조회
GET /wrong-notes/{uuid} - 오답 노트 상세 조회
POST /wrong-notes - 오답 노트 생성
PUT /wrong-notes/{uuid} - 오답 노트 수정
DELETE /wrong-notes/{uuid} - 오답 노트 삭제
POST /wrong-notes/{uuid}/generate-explanation - AI 설명 생성
사용자 노트 (Note)
GET /notes - 노트 목록 조회
GET /notes/{uuid} - 노트 상세 조회
POST /notes - 노트 생성
PUT /notes/{uuid} - 노트 수정
DELETE /notes/{uuid} - 노트 삭제
보상 (Reward)
GET /rewards/history - 보상 이력 조회
GET /rewards/total - 총 보상 포인트 조회
요청/응답 예시
로그인 요청:

{
  "user_id": "user123",
  "password": "password123"
}
로그인 응답:

{
  "accessToken": "jwt-token-here",
  "refreshToken": "refresh-token-here",
  "member": {
    "uuid": "member-uuid",
    "user_id": "user123",
    "nickname": "사용자닉네임",
    "birth": "1995-01-01",
    "is_locked": false,
    "role": "user"
  }
}
회원가입 요청:

{
  "user_id": "user123",
  "password": "password123",
  "birth": "1995-01-01",
  "nickname": "사용자닉네임"
}
🚀 빌드 및 배포
프로덕션 빌드
npm run build
정적 파일 서빙
빌드된 dist/ 폴더의 파일들을 웹 서버로 서빙하세요.

Docker를 사용한 프로덕션 배포
# 빌드
docker build -t eduquest-frontend:latest .

# 실행
docker run -d -p 80:80 --name eduquest-prod eduquest-frontend:latest
📝 사용 가능한 스크립트
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 실행
🛠️ 최신 변경사항
2026.04.08 - Backend API 구조 동기화
API 타입 및 엔드포인트 표준화

user_id 필드명 통일 (기존 id → user_id)
로그인 엔드포인트: /auth/login (기존 /auth/sign-in)
회원가입 엔드포인트: /auth/register (기존 /auth/sign-up)
응답 구조: member 객체 포함
신규 API 모듈 추가 (5개)

src/api/bookmark.ts - 문제 북마크 기능
src/api/wallet.ts - 지갑 및 포인트 관리
src/api/wrong_note.ts - 오답 노트 (AI 설명 포함)
src/api/note.ts - 사용자 노트
src/api/reward.ts - 학습 보상 이력
상태관리 변경

Reactive auth store 사용
Vue Router 기반 라우팅으로 전환
페이지 컴포넌트 리팩토링

LoginPage: 기본 로그인만 지원으로 단순화
Signup: 폼 검증 강화 및 API 통합 개선
Axios 인터셉터 강화

refreshToken 없을 때 자동 로그인 페이지 리다이렉트
토큰 갱신 실패 시 안전한 로그아웃 처리
이전 변경사항

HomePage 리디자인: 모던 스타일, 좌/우 분할 레이아웃
API 모듈화: auth.ts, community.ts, learning.ts
🤝 기여하기
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature')
Open a Pull Request
📄 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.
