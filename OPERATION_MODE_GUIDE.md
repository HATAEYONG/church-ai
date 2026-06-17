# 에이맨(A-Men) 운영 모드 전환 가이드

이 가이드를 따라 에이맨을 **데모 모드**에서 **운영 모드**로 전환하세요.

## 🎯 데모 모드 vs 운영 모드

| 특징 | 데모 모드 | 운영 모드 |
|------|----------|----------|
| 데이터 저장 | 브라우저 localStorage | Supabase 클라우드 (Postgres) |
| 데이터 동기화 | 불가 | 가능 (여러 기기 간) |
| 로그인 필요 | 없음 | 필요 (이메일/비밀번호) |
| AI 멘토 | 비활성화 | 활성화 |
| 데이터 보존 | 브라우저 캐시 삭제 시 소실 | 클라우드 영구 저장 |
| 접근 권한 | 없음 | RLS 보호 |

## 📋 전환 절차 (4단계)

### 1단계: Supabase 정보 확보 ✅

`SUPABASE_SETUP_GUIDE.md`를 참고하여 정보를 확인하세요.

### 2단계: 데이터베이스 스키마 적용 ✅

`DATABASE_SCHEMA_SETUP_GUIDE.md`를 참고하여 스키마를 적용하세요.

### 3단계: .env.local 파일 설정 ⏳

프로젝트 루트의 `.env.local` 파일에 실제 값을 입력하세요.

```env
# ─────────────────────────────────────────────────────────────
# 에이맨(A-Men) 운영 모드 환경 변수
# ─────────────────────────────────────────────────────────────

# Supabase (인증 + 데이터베이스)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

# Claude API (AI 신앙 멘토)
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# AI 멘토에 사용할 모델 (기본값: claude-opus-4-8)
ANTHROPIC_MODEL=claude-opus-4-8
```

#### 값 입력 예시

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZGh5eHl6Iiwicm9sZSI6ImFub24iLCJleHAiOjE3MTQ4MDcyOTAsImlhdCI6NDQ4ODIxNzQ5LCJqdGkiOiJMWEdDUk1XZHlmSG1IRmxSIiwidXNlcl9jbGFpbXMiOiJyb2xlOmFub24ifQ.YOUR_ACTUAL_KEY

# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-1234567890abcdefghijklmnop

# 모델 (선택사항)
ANTHROPIC_MODEL=claude-opus-4-8
```

### 4단계: 개발 서버 재시작 🔄

환경 변수가 적용되도록 개발 서버를 재시작하세요.

#### 현재 서버 중지
터미널에서 `Ctrl+C`를 눌러 서버를 중지하세요.

#### 서버 재시작
```bash
npm run dev
```

## 🚀 운영 모드 확인

### 1. 로그인 페이지 접속

1. 브라우저에서 `http://localhost:3000/login` 접속
2. **"회원가입"** 클릭
3. 이메일/비밀번호 입력
4. 가입 완료

### 2. 로그인 후 데이터 확인

로그인하면 다음 기능들이 작동합니다:

#### 기도 노트 (`/prayer`)
- 작성한 기도 제목이 클라우드에 저장
- 다른 브라우저에서도 동일한 데이터 확인 가능

#### 감사 노트 (`/gratitude`)
- 감사 기록이 클라우드에 저장
- 날짜별로 조회 가능

#### 게임 (`/games`)
- 게임 결과가 클라우드에 저장
- 점수 추적 가능

#### AI 멘토 (`/mentor`)
- AI 신앙 멘토 채팅 기능 활성화
- 대화 로그가 클라우드에 저장

### 3. 데이터베이스 직접 확인

Supabase Dashboard → Table Editor에서 데이터가 저장되는지 확인:

```
┌──────────────────────────────────────────┐
│  profiles                                 │
│  ┌────────────────────────────────────┐  │
│  │ id | name | role | department...  │  │
│  ├────────────────────────────────────┤  │
│  │ uuid... | 홍길동 | student | ... │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## 🔐 보안 및 개인정보

### .env.local 파일 보안

⚠️ **중요:** `.env.local` 파일은 절대 공개하지 마세요!

1. **.gitignore 확인**
   ```gitignore
   .env.local
   .env.*.local
   ```

2. **공유 금지**
   - GitHub, Slack 등에 절대 업로드 금지
   - API Key 유출 시 즉시 재발급 필요

### Row Level Security (RLS)

운영 모드는 RLS로 보호됩니다:

- **본인 데이터:** 본인만 CRUD 가능
- **교사/관리자:** 학생 데이터 조회 가능
- **익명 사용자:** 데이터 접근 불가

## 🧪 테스트 시나리오

### 시나리오 1: 첫 사용자 가입

1. **회원가입**
   - `/login` → 회원가입
   - 이메일: `test@example.com`
   - 비밀번호: `password123`

2. **프로필 자동 생성**
   - `profiles` 테이블에 자동 생성 확인
   - 역할: `student` (기본값)

3. **기도 노트 작성**
   - `/prayer` 접속
   - "오늘의 기도" 작성
   - 저장 버튼 클릭

4. **데이터베이스 확인**
   - `prayer_notes` 테이블에 데이터 저장 확인

### 시나리오 2: 다른 기기에서 접속

1. **시크릿 모드 열기**
   - 브라우저 시크릿 모드/프라이빗 모드 실행

2. **동일 계정으로 로그인**
   - `/login` → 로그인
   - 동일 이메일/비밀번호 입력

3. **데이터 동기화 확인**
   - 이전에 작성한 기도 노트가 보이는지 확인
   - ✅ 보인면 클라우드 동기화 성공!

### 시나리오 3: AI 멘토 기능 테스트

1. **AI 멘토 접속**
   - `/mentor` 접속

2. **메시지 전송**
   - "요셉에 대해 알려줘" 입력
   - 전송 버튼 클릭

3. **응답 확인**
   - AI가 요셉에 대한 묵상을 답변
   - ✅ 응답이 오면 AI 멘토 활성화 성공!

## 🔄 데모 모드로 되돌리기

운영 모드에서 데모 모드로 되돌리려면:

### 방법 1: .env.local 삭제
```bash
rm .env.local
npm run dev
```

### 방법 2: .env.local 이름 변경
```bash
mv .env.local .env.local.backup
npm run dev
```

→ 자동으로 데모 모드(localStorage)로 작동합니다.

## 📊 운영 모드에서의 데이터 구조

```
┌─────────────────────────────────────────────────────┐
│              Supabase Project                       │
│  ┌──────────────────────────────────────────────┐  │
│  │  Authentication (auth.users)                 │  │
│  │  - 이메일/비밀번호 로그인                    │  │
│  │  - 세션 관리                                 │  │
│  └──────────────────┬───────────────────────────┘  │
│                     │ 1:1                          │
│  ┌──────────────────▼───────────────────────────┐  │
│  │  profiles (사용자 프로필)                    │  │
│  │  - name, role, department, class_name        │  │
│  └──────────────────┬───────────────────────────┘  │
│                     │ 1:N                          │
│    ┌────────────────┼────────────────┐           │
│    ▼                ▼                ▼           │
│ ┌──────────┐   ┌──────────┐   ┌──────────┐      │
│ │ prayer   │   │gratitude │   │meditation│      │
│ │ _notes   │   │ _notes   │   │    s     │      │
│ └──────────┘   └──────────┘   └──────────┘      │
│                                              │
│ ┌──────────┐   ┌──────────┐   ┌──────────┐      │
│ │  game    │   │  badges  │   │  mentor  │      │
│ │ _results │   │          │   │_messages │      │
│ └──────────┘   └──────────┘   └──────────┘      │
└─────────────────────────────────────────────────────┘
```

## ⚠️ 운영 모드 시작 전 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] Supabase URL/Anon Key 확인 완료
- [ ] 데이터베이스 스키마 적용 완료
- [ ] .env.local 파일에 실제 값 입력 완료
- [ ] 개발 서버 재시작 완료
- [ ] 로그인 페이지에서 회원가입 테스트 완료
- [ ] 기도/감사 노트 작성 및 저장 테스트 완료
- [ ] AI 멘토 기능 테스트 완료 (API Key 설정된 경우)

## 🎉 축하합니다!

운영 모드 설정이 완료되었습니다. 이제 다음 기능들을 사용할 수 있습니다:

✅ 여러 기기 간 데이터 동기화
✅ 영구적인 데이터 저장
✅ AI 신앙 멘토 기능
✅ 교사용 대시보드 (학생 활동 모니터링)
✅ 관리자 대시보드 (부서별 현황)

---

## 📞 추가 도움이 필요하시면

- **Supabase 문서**: https://supabase.com/docs
- **Anthropic 문서**: https://docs.anthropic.com
- **Next.js 문서**: https://nextjs.org/docs

---

*운영 모드 전환 완료! 에이맨과 함께 신앙의 여정을 시작하세요.*
