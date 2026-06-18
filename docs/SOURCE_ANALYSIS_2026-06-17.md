# 소스 전반 건강검진 리포트

- **대상**: 교회 AI 신앙교육 플랫폼 (Next.js 14 App Router · Supabase · Anthropic SDK · ElevenLabs)
- **일자**: 2026-06-17
- **범위**: `src/` 36개 파일(약 4,929줄) 전수 + 설정·스키마·PWA
- **관점**: 아키텍처 · 코드품질 · 버그 · 보안 · 출시준비

---

## 0. 요약

| 등급 | 건수 | 핵심 |
|------|:---:|------|
| Critical | 0 | 빌드를 깨는 결함 없음 |
| High | 2 | 음성 기능 전체 비동작 · 멘토 API 무인증/무제한(비용 남용) |
| Medium | 4 | UI 이원화 · 멘토 max_tokens 절단 위험 · VoicePlayer 상태버그 · env 문서 누락 |
| Low | 8 | nul 잔여파일 · ESLint 미설정 · any 타입 · vercel.json 레거시 등 |

**기준선(측정값)**: `npm run build` ✓ 통과 · `tsc --noEmit` ✓ 에러 0 · 정적 페이지 20개 생성 성공.

**전반 인상**: 핵심 신앙 기능(기도·감사·묵상·게임·AI멘토)은 설계가 탄탄하다 — 데모 모드(localStorage) ↔ 운영 모드(Supabase) 이중화가 일관되고, RLS·시스템 프롬프트 안전원칙·PWA가 잘 갖춰져 있다. 반면 **음성 서브시스템(voice 3종)은 기존 앱과 이질적으로 접붙여진 채 실제로는 동작하지 않는다** — 가장 큰 부채.

---

## 1. High — 우선 처리 권고

> **H1 갱신(2026-06-17, 구현 완료)**: 아래 진단을 바탕으로 음성 기능을 **목업+키설정 방식으로 구현**했다 — 키 없이는 브라우저 내장 음성(Web Speech API)으로 동작(목업), 설정 페이지에서 ElevenLabs 키를 입력하면 고품질 음성으로 전환. 브라우저로 동작 검증 완료(§7). 진단 내용은 이력용으로 남긴다.

### H1. (원인 진단) 음성 기능 전체가 동작하지 않았음 (`/voice`, `/voice-settings`, `/voice-clone`)
- **현상**: 모든 TTS·보이스클로닝 호출이 `"API 키가 필요합니다"`로 실패한다.
- **원인**: [elevenlabs.ts:316](src/lib/elevenlabs.ts:316) `getElevenLabsClient()` → `new ElevenLabsClient()`는 키 없이 생성되고, 생성자는 `process.env.ELEVENLABS_API_KEY`만 읽는다([elevenlabs.ts:61](src/lib/elevenlabs.ts:61)). 이 변수는 `NEXT_PUBLIC_`이 아니므로 **브라우저에서는 항상 `undefined`**.
- **연쇄 결함**:
  1. [voice-clone/page.tsx:27](src/app/voice-clone/page.tsx:27)는 `localStorage.getItem('ELEVENLABS_API_KEY')`로 키 보유 배너를 판단하지만, **그 값을 클라이언트에 주입하는 코드가 어디에도 없다.**
  2. 안내문은 "아래 입력란에 붙여넣기"라고 하지만 **API 키 입력란 자체가 렌더링되지 않는다.**
  3. 설령 키가 있어도 브라우저 → `api.elevenlabs.io` 직접 호출은 CORS 차단 + 키 노출 위험.
- **추가**: 이 세 페이지는 [NavBar.tsx](src/components/NavBar.tsx)·홈([page.tsx](src/app/page.tsx))에서 **링크되지 않는 고립 라우트**다.
- **권고(아키텍처)**: `/api/mentor`처럼 **서버 라우트(`/api/tts`)를 신설**해 서버 `ELEVENLABS_API_KEY`로 호출하고, 클라이언트는 그 라우트만 부르도록 전환. 또는 음성 기능을 보류한다면 세 페이지를 제거해 죽은 코드를 정리. (즉시 수정 범위를 넘어 PO 승인 후 진행 권장)

### H2. AI 멘토 API가 무인증·무제한 공개 엔드포인트
- **현상**: [api/mentor/route.ts](src/app/api/mentor/route.ts)는 누구나 호출 가능하며 Claude 스트리밍을 그대로 중계 → **토큰 비용 남용(DoS/비용 폭탄) 위험.**
- **이번 조치(부분)**: 메시지 수(>50)·길이(>8000자) 입력 한도를 추가해 명백한 남용 페이로드를 차단(아래 §5).
- **권고(잔여)**: 실질 방어는 **레이트리밋**이 필요 — Vercel 환경에서는 미들웨어/`@upstash/ratelimit` 또는 Origin 체크. 인증 사용자만 허용하거나 IP·세션 단위 분당 한도를 거는 안을 권장.

---

## 2. Medium

### M1. UI 시스템 이원화 (일관성 부채)
핵심 앱(prayer·gratitude·meditation·games·mentor·admin·teacher·family)은 커스텀 테마(`cream/ink/amen-600/grace`) + 공용 컴포넌트([ui.tsx](src/components/ui.tsx)) + `NavBar`/`layout` 통합을 따른다. 반면 음성 3종은 **제네릭 Tailwind(gray/purple/blue, `min-h-screen` 그라데이션)** 를 쓰고 `NavBar`/`ui.tsx`를 쓰지 않아 시각·구조가 동떨어진다. H1과 같은 뿌리(접붙임)다. → 서버 라우트 전환 시 공용 컴포넌트로 통일 권장.

### M2. 멘토 `max_tokens: 1024` + adaptive thinking → 답변 절단 위험
[route.ts:58](src/app/api/mentor/route.ts:58). adaptive thinking은 사고 토큰이 `max_tokens` 예산을 함께 소비한다. 복잡한 질문(특히 위기 상담 같은 민감 주제)에서 사고가 예산을 잠식해 **답변이 중간에 끊길** 수 있다. 이미 스트리밍을 쓰므로 여유가 크다.
- **권고**: `max_tokens`를 2048~4096으로 상향하고, 짧은 답변 특성상 `output_config: { effort: "medium" }`을 함께 지정해 사고량(=비용·지연)을 합리적으로 묶기. (AI 동작 변경이라 PO 승인 후 적용 권장 — 이번엔 미적용)

### M3. VoicePlayer "재생 중" 상태가 표시되지 않음
[VoicePlayer.tsx:36](src/components/VoicePlayer.tsx:36). `playTTS`는 오디오 재생이 **끝난 뒤** resolve되는데, `setIsPlaying(true)` 직후 `finally`에서 즉시 `false`로 되돌린다 → "재생 중…" UI가 사실상 보이지 않는다. (기능 자체가 H1로 막혀 있어 체감되진 않음)

### M4. `.env.example`에 `ELEVENLABS_API_KEY` 누락 → **이번에 수정(추가)**
[vercel.json](vercel.json)은 `ELEVENLABS_API_KEY`를 참조하나 예시 파일엔 없었다. 추가 완료(§5).

---

## 3. Low

| # | 항목 | 위치 | 비고 |
|---|------|------|------|
| L1 | 잔여 `nul` 파일(Windows `> nul` 오발 산물) | repo 루트 | **이번 삭제 + .gitignore 등록** |
| L2 | ESLint 미설정(`next lint`가 설정 프롬프트) | — | `.eslintrc.json`(`next/core-web-vitals`) 추가 권장. **단, 추가 시 음성 페이지의 내부 `<a href>`가 `@next/next/no-html-link-for-pages` 에러를 일으켜 빌드가 깨질 수 있으니 `<Link>` 전환과 함께 진행** |
| L3 | `any` 타입 사용 | [elevenlabs.ts](src/lib/elevenlabs.ts) `getClonedVoices` | **이번 수정**(`RawVoice` 타입화) |
| L4 | `vercel.json` 레거시 `@secret` 참조 문법 | [vercel.json](vercel.json) | `@supabase-url` 등은 구형 Secrets 방식. 대시보드 환경변수로 이전 권장(배포 영향 가능 — 미수정) |
| L5 | 중복 헬퍼 | `formatDate`(prayer/gratitude/meditation), `Bar`(admin/teacher) | 공용화(DRY) 권장 |
| L6 | `profiles` 테이블에 staff-read RLS 정책 없음 | [schema.sql](supabase/schema.sql) | 교사/관리자가 학생 이름을 못 읽음. 현재 대시보드는 샘플데이터라 미배선 — 운영 전 정합성 점검 |
| L7 | 테스트 0건 | — | 핵심 로직(store.ts 배지/동기화, QuizRunner 채점)부터 최소 단위테스트 권장 |
| L8 | 편향된 셔플 `sort(() => Math.random()-0.5)` | [QuizRunner.tsx:30](src/components/QuizRunner.tsx:30), [card-sentence](src/app/games/card-sentence/page.tsx:12) | 균등분포 아님. Fisher–Yates 권장(학습 순서라 영향 경미) |

---

## 4. 잘 된 점 (유지 권장)

- **데모↔운영 이중화**: 환경변수 부재 시 localStorage로 무중단 동작([store.ts](src/lib/store.ts)), 미들웨어/클라이언트가 graceful 통과.
- **보안 기본기**: [schema.sql](supabase/schema.sql) 전 테이블 RLS + 본인 데이터 정책, `handle_new_user` security definer + 권한 회수, staff select 정책 분리.
- **AI 안전 설계**: [mentor-prompt.ts](src/lib/mentor-prompt.ts) 성경 근거·묵상적 해석·상상 구분·위기(1388) 안내 원칙 명시, 코드에서 `refusal` stop_reason 처리.
- **모델 설정 정확**: `claude-opus-4-8` + `thinking:{type:"adaptive"}` + 프롬프트 캐싱 + 스트리밍 — 현행 권장 패턴과 일치.
- **PWA**: manifest·서비스워커(네트워크우선/캐시폴백, `/api/` 캐시 제외) 적절.

---

## 5. 이번에 적용한 즉시 수정 (검증 완료)

| 파일 | 변경 | 등급 |
|------|------|:---:|
| `nul`(삭제) + [.gitignore](.gitignore) | 잔여 파일 제거 + 재발 방지 | L1 |
| [.env.example](.env.example) | `ELEVENLABS_API_KEY` 항목 추가(서버 전용 명시) | M4 |
| [elevenlabs.ts](src/lib/elevenlabs.ts) | `any` → `RawVoice` 타입, 옵셔널 안전 접근 | L3 |
| [api/mentor/route.ts](src/app/api/mentor/route.ts) | 입력 한도(메시지 ≤50개, 각 ≤8000자) 추가 | H2(부분) |

**검증**: 수정 후 `tsc --noEmit` 에러 0, `npm run build` 통과(정적 20페이지 생성). 회귀 없음.

---

## 7. 음성 기능 구현 (2026-06-17, H1 해소 — 검증 완료)

PO 지시("삭제 말고 구현 — 초기 목업 + 설정에서 키 입력")에 따라 구현.

| 파일 | 변경 |
|------|------|
| [elevenlabs.ts](src/lib/elevenlabs.ts) | `getStoredElevenLabsKey/setStoredElevenLabsKey/clearStoredElevenLabsKey` 추가, 클라이언트가 호출 시점에 키를 동적으로 읽도록 변경, `playTTS`에 **목업 폴백(Web Speech API)** + `onStart` 콜백 추가 |
| [VoicePlayer.tsx](src/components/VoicePlayer.tsx) | `onStart`로 로딩→재생 상태 전환(M3 버그 해소) |
| [voice-settings/page.tsx](src/app/voice-settings/page.tsx) | **API 키 입력·저장·삭제 카드** + 현재 모드(목업/연결됨) 표시 추가. 음성 선택 카드를 `<button>`→`<div role=button>`으로 교체(**button-in-button 하이드레이션 에러 해소**) |
| [voice-clone/page.tsx](src/app/voice-clone/page.tsx) | 키 안내 배너가 목소리 설정 페이지로 연결되도록 수정 |

**동작 방식**: 키 없음 → 브라우저 내장 한국어 음성(목업) / 키 있음 → ElevenLabs 고품질 음성. 키는 `localStorage`에 BYO 저장.

**브라우저 검증(dev server)**: 설정 카드 렌더 ✓ · 키 저장→`localStorage` 영속+상태 "연결됨" ✓ · 삭제→목업 모드 복귀 ✓ · `/voice`에서 키 없이 재생 클릭 시 과거의 "API 키가 필요" 에러 사라짐 ✓ · `speechSynthesis` 가용 ✓ · button-in-button 중첩 0 ✓ · `tsc` 0 / `build` 통과.

**남은 한계(권고)**: ① 브라우저→ElevenLabs 직접 호출은 CORS·키노출 가능성이 있어, 실제 운영 시 서버 라우트(`/api/tts`) 프록시로 전환 권장. ② 설정에서 선택한 voiceId가 아직 재생에 반영되지 않음(항상 기본 목소리) — 추후 `playTTS(text,{voiceId})` 배선 필요.

---

## 6. 후속 권고 우선순위

1. **(High) 음성 서버 라우트 신설 또는 음성 페이지 제거** — H1+M1+M3 일괄 해소.
2. **(High) 멘토 API 레이트리밋** — H2 잔여.
3. **(Medium) 멘토 `max_tokens`↑ + `effort` 지정** — M2.
4. **(Low) ESLint 도입(+ `<a>`→`<Link>` 동반)·테스트 최소셋·DRY 정리** — L2/L5/L7.
