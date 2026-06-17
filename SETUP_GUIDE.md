# 에이맨(A-Men) 개발 환경 설정 가이드

이 가이드는 에이맨(A-Men) 프로젝트의 로컬 개발 환경을 설정하는 방법을 안내합니다.

## 📋 전제 조건

- **Node.js**: v18.0.0 이상 (현재 사용 중: v24.16.0)
- **npm**: 8.0.0 이상 (현재 사용 중: 11.6.2)
- **운영체제**: Windows, macOS, Linux

## 🚀 빠른 시작 (데모 모드)

데모 모드에서는 별도의 환경 변수 설정 없이 프로젝트를 실행할 수 있습니다. 모든 데이터는 브라우저의 `localStorage`에 저장됩니다.

### 1. 의존성 설치

```bash
cd C:\work\church-ai
npm install
```

### 2. 개발 서버 시작

```bash
npm run dev
```

### 3. 브라우저 접속

브라우저에서 `http://localhost:3000` 접속합니다.

### 4. 빌드 테스트 (선택)

```bash
npm run build
```

## 🌐 운영 모드 설정 (Supabase + Claude API)

운영 모드에서는 데이터가 클라우드(Postgres)에 저장되고, AI 멘토 기능을 사용할 수 있습니다.

### 1. Supabase 설정

#### 1.1 프로젝트 생성

1. [Supabase](https://supabase.com/dashboard) 접속
2. 새 프로젝트 생성
3. 프로젝트 설정 → API에서 다음 정보 확인:
   - Project URL
   - `anon` `public` key

#### 1.2 데이터베이스 스키마 적용

```bash
# Supabase Dashboard → SQL Editor → New Query
# 또는
psql -h <your-project>.supabase.co -U postgres -d postgres -f supabase/schema.sql
```

### 2. Claude API 설정 (AI 멘토 기능)

#### 2.1 API 키 발급

1. [Anthropic Console](https://console.anthropic.com/) 접속
2. API Keys에서 새 키 생성
3. 키를 안전한 곳에 저장

#### 2.2 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Claude API (AI 멘토 기능)
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-opus-4-8
```

### 3. 로그인 및 사용

1. `http://localhost:3000/login` 접속
2. 이메일/비밀번호로 로그인 (또는 회원가입)
3. 모든 데이터가 클라우드에 동기화됩니다.

## 🛠️ 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 시작 |
| `npm run lint` | ESLint 코드 검사 |

## 📁 프로젝트 구조

```
church-ai/
├── src/
│   ├── app/              # Next.js App Router 페이지
│   │   ├── prayer/       # 기도 노트
│   │   ├── gratitude/    # 감사 노트
│   │   ├── games/        # 게임형 신앙학습
│   │   ├── mentor/       # AI 신앙 멘토
│   │   ├── teacher/      # 교사용 대시보드
│   │   └── admin/        # 관리자 대시보드
│   ├── components/       # 공용 UI 컴포넌트
│   ├── lib/              # 유틸리티, 데이터, 스토어
│   │   ├── data/         # 게임 데이터, 대시보드 데이터
│   │   ├── supabase/     # Supabase 클라이언트
│   │   └── mentor-prompt.ts  # AI 멘토 시스템 프롬프트
│   └── middleware.ts     # Next.js 미들웨어 (인증)
├── supabase/
│   └── schema.sql        # 데이터베이스 스키마
└── public/               # 정적 파일
```

## 🔧 트러블슈팅

### 포트 충돌 (3000)

```bash
# 다른 포트 사용
npm run dev -- -p 3001
```

### 의존성 설치 실패

```bash
# 캐시 삭제 후 재시도
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 빌드 실패

```bash
# 빌드 캐시 삭제
rm -rf .next
npm run build
```

### Windows 특정 이슈

- PowerShell 관리자 권한으로 시도
- 또는 WSL2 (Windows Subsystem for Linux) 사용

### Node.js 버전 호환성

```bash
# Node.js v20 LTS 권장
nvm install 20
nvm use 20
```

## 📊 주요 기능

### 성도용 기능

- **기도 노트**: 오늘의 기도 제목 기록, 응답 표시 (`/prayer`)
- **감사 노트**: 하루의 감사 기록 (`/gratitude`)
- **게임형 학습**: 성경 퀴즈, 기도 인물 맞추기, 카드 문장 연결 (`/games`)
- **AI 멘토**: 성경 인물 페르소나와 묵상 대화 (`/mentor`)

### 관리 기능

- **교사용 대시보드**: 학생들의 주중 신앙 활동 한눈에 보기 (`/teacher`)
- **관리자 대시보드**: 부서별 신앙교육 통합 현황 (`/admin`)

## 🔐 보안 및 안전

### AI 안전 활용 원칙

에이맨의 AI 멘토는 **성경 묵상과 기도 습관 형성을 돕는 보조 도구**입니다. 시스템 프롬프트(`src/lib/mentor-prompt.ts`)에 다음 원칙이 명시되어 있습니다:

1. **성경 본문 근거** — 성경에 기록된 내용은 본문을 함께 제시
2. **묵상적 해석** — 적용은 열린 제안으로 표현
3. **상상적 대화** — 성경에 없는 내용은 "상상해 보면"으로 구분
4. **목회자 검토 영역** — 교리 판단·민감한 개인사는 목회자·부모와 나누도록 안내

> AI는 성경을 대체하지 않으며, 목회자의 권위나 교회의 가르침을 대신하지 않습니다.

## 🚀 Vercel 배포

### 1. 환경 변수 등록

Vercel Dashboard → Project Settings → Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY (선택)
```

### 2. 배포

```bash
vercel deploy
```

## 📞 도움말

- **GitHub Issues**: https://github.com/anthropics/claude-code/issues
- **Next.js 문서**: https://nextjs.org/docs
- **Supabase 문서**: https://supabase.com/docs
- **Anthropic 문서**: https://docs.anthropic.com

---

*이 가이드는 에이맨 프로젝트의 개발 환경 설정을 돕기 위해 작성되었습니다.*
