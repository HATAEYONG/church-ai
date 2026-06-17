# AI 기반 신앙교육 플랫폼

> 기도는 기록될 때 신앙의 여정이 되고, 감사는 남겨질 때 은혜의 기억이 됩니다.

**기도노트 & 감사노트** 앱에서 출발한, 다음 세대 신앙교육을 위한
AI 기반 플랫폼입니다. 성도용 앱 · 게임형 신앙학습 · AI 신앙 멘토 ·
교사용 대시보드 · 관리자 대시보드를 하나로 잇는 토털 솔루션 구조를 지향합니다.

## 주요 기능

| 기능 | 설명 | 경로 |
| --- | --- | --- |
| 🙏 기도노트 | 오늘의 기도 제목 기록, 응답 표시 | `/prayer` |
| 💛 감사노트 | 하루의 감사 기록 | `/gratitude` |
| 📖 성경퀴즈 | 말씀 내용을 퀴즈로 복습 | `/games/quiz` |
| 🙇 기도 인물 맞추기 | 기도문을 보고 인물 맞히기 + 묵상 | `/games/prayer-person` |
| 🧩 카드문장 연결하기 | 흩어진 말씀 조각을 순서대로 연결 | `/games/card-sentence` |
| 🕊️ AI 신앙 멘토 | 성경 인물 페르소나와 묵상 대화 (Claude) | `/mentor` |
| 📊 교사용 대시보드 | 학생들의 주중 신앙 활동 한눈에 | `/teacher` |
| ⚙️ 관리자 대시보드 | 부서별 신앙교육 통합 현황 | `/admin` |

## 기술 스택

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** — 인증 & 데이터베이스 (선택, 미설정 시 데모 모드)
- **Claude API** (`@anthropic-ai/sdk`) — AI 신앙 멘토 (`claude-opus-4-8`, 스트리밍)
- **Vercel** — 배포

## 시작하기

```bash
npm install
cp .env.example .env.local   # 값을 채워주세요
npm run dev
```

`http://localhost:3000` 에서 확인합니다.

### 환경 변수

`.env.local` 에 다음을 설정합니다 (`.env.example` 참고):

- `ANTHROPIC_API_KEY` — AI 신앙 멘토에 필요 (없으면 멘토만 비활성화)
- `ANTHROPIC_MODEL` — 기본값 `claude-opus-4-8`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 운영 데이터베이스 (선택)

### 데모 모드 vs 운영 모드 (인증 + 클라우드 동기화)

- **데모 모드:** Supabase 환경 변수가 없거나 로그아웃 상태이면, 기도/감사/묵상
  기록을 브라우저 `localStorage` 에 저장합니다. 추가 설정 없이 바로 체험할 수
  있어요.
- **운영 모드:** Supabase 환경 변수가 있고 `/login` 으로 로그인하면, 기도·감사·
  묵상 기록이 클라우드(Postgres)에 RLS 보호 하에 저장되어 어느 기기에서나
  이어집니다.

스키마는 `supabase/schema.sql` 에 있으며, 새 Supabase 프로젝트에서 SQL Editor 로
실행하거나 Supabase CLI 로 적용하면 됩니다. 인증 흐름은 `src/lib/supabase/auth.tsx`
(AuthProvider) + `src/middleware.ts`(세션 갱신) + `src/app/login/page.tsx` 에
구현되어 있습니다.

> 참고: 이메일+비밀번호 회원가입은 Supabase 기본 설정상 이메일 확인이 필요합니다.
> 즉시 로그인 데모를 원하면 Supabase 대시보드 → Authentication → 이메일 확인을
> 끄거나, 매직링크를 사용하세요.

**Vercel 배포 시:** 프로젝트 Settings → Environment Variables 에
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`(+선택 `ANTHROPIC_API_KEY`)
를 등록한 뒤 재배포하면 운영 모드가 활성화됩니다.

## AI 안전 활용 원칙

이 플랫폼의 AI 멘토는 **성경 묵상과 기도 습관 형성을 돕는 보조 도구**입니다.
시스템 프롬프트(`src/lib/mentor-prompt.ts`)에 다음 원칙을 명시했습니다.

1. **성경 본문 근거** — 성경에 기록된 내용은 본문을 함께 제시
2. **묵상적 해석** — 적용은 열린 제안으로 표현
3. **상상적 대화** — 성경에 없는 내용은 "상상해 보면"으로 구분
4. **목회자 검토 영역** — 교리 판단·민감한 개인사는 목회자·부모와 나누도록 안내

AI는 성경을 대체하지 않으며, 목회자의 권위나 교회의 가르침을 대신하지 않습니다.

## 프로젝트 구조

```
src/
  app/
    page.tsx              홈 (성도용 대시보드)
    prayer/ gratitude/    기도·감사노트
    games/                게임형 신앙학습 허브 + 3종
    mentor/               AI 신앙 멘토 (채팅)
    teacher/ admin/       교사·관리자 대시보드
    api/mentor/route.ts   Claude 스트리밍 API
  components/             공통 UI (NavBar, QuizRunner 등)
  lib/
    data/games.ts         게임 콘텐츠(퀴즈·기도인물·카드문장)
    data/dashboard.ts     대시보드 예시 데이터
    store.ts              localStorage 데모 저장소
    mentor-prompt.ts      AI 멘토 시스템 프롬프트 + 페르소나
    supabase/             Supabase 클라이언트
supabase/schema.sql       운영 DB 스키마 + RLS
```
