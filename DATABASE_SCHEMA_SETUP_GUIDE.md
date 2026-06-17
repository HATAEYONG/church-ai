# 데이터베이스 스키마 적용 가이드

이 가이드를 따라 Supabase 데이터베이스에 에이맨(A-Men)의 스키마를 적용하세요.

## 📋 개요

에이맨의 데이터베이스 스키마는 다음 8개 테이블로 구성됩니다:

1. **profiles** - 사용자 프로필 (auth.users와 연결)
2. **prayer_notes** - 기도 노트
3. **gratitude_notes** - 감사 노트
4. **meditations** - 말씀 묵상 기록
5. **game_results** - 게임 결과 (퀴즈, 기도 인물, 카드 문장)
6. **badges** - 성장 배지
7. **mentor_messages** - AI 멘토 대화 로그
8. **user_role, game_type** - 열거형 (Enum) 타입

## 🚀 적용 방법 (2가지)

### 방법 1: Supabase Dashboard SQL Editor (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 **SQL Editor** (💻 아이콘) 클릭
   - **"New query"** 버튼 클릭

3. **스키마 붙여넣기**
   - 프로젝트의 `supabase/schema.sql` 파일 내용 복사
   - SQL Editor에 붙여넣기
   - **"Run"** 버튼 클릭 (또는 `Ctrl+Enter`)

4. **결과 확인**
   - "Success." 메시지 확인
   - 약 162줄의 SQL이 실행되어야 합니다

### 방법 2: Supabase CLI (고급 사용자)

```bash
# Supabase CLI 설치 후
supabase link --project-ref your-project-id
supabase db push
```

## ✅ 적용 완료 확인

스키마 적용이 완료되면 다음을 확인하세요:

### 1. Table Editor에서 테이블 확인

1. Supabase Dashboard → **Table Editor** 클릭
2. 다음 8개 테이블이 존재하는지 확인:
   - ✅ profiles
   - ✅ prayer_notes
   - ✅ gratitude_notes
   - ✅ meditations
   - ✅ game_results
   - ✅ badges
   - ✅ mentor_messages

### 2. 데이터베이스 구조 이해

```
┌─────────────────────────────────────────────────────┐
│                    auth.users                        │
│                 (Supabase Auth)                      │
└──────────────────────────┬──────────────────────────┘
                           │ 1:1
                           ▼
┌─────────────────────────────────────────────────────┐
│                    profiles                         │
│  - id (UUID) PK                                     │
│  - name, role, department, class_name              │
│  - guardian_of (자녀 ID, 부모용)                    │
└──────────────────────────┬──────────────────────────┘
                           │ 1:N
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ prayer   │      │gratitude │      │meditation│
    │ _notes   │      │  _notes  │      │    s     │
    └──────────┘      └──────────┘      └──────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │   game   │      │  badges  │      │  mentor  │
    │ _results │      │          │      │_messages │
    └──────────┘      └──────────┘      └──────────┘
```

## 🔒 Row Level Security (RLS)

스키마에는 이미 RLS 정책이 포함되어 있습니다:

### 본인 데이터 보호
- 각 사용자는 자신의 데이터만 CRUD 가능
- 다른 사람의 데이터는 접근 불가

### 교사/관리자 권한
- 교사(`teacher`)와 관리자(`admin`)는 학생들의 기록을 조회 가능
- 대시보드에서 학생들의 활동을 모니터링할 수 있음

## 🎯 주요 기능

### 1. 자동 프로필 생성
새 사용자 가입 시 `profiles` 테이블에 자동으로 프로필 생성
- `handle_new_user()` 함수가 트리거로 작동

### 2. 부모-자녀 연결
부모 계정에서 자녀의 활동을 볼 수 있음
- `profiles.guardian_of` 필드로 연결

### 3. 게임 결과 저장
3가지 게임 타입 지원:
- `bible-quiz` - 성경 퀴즈
- `prayer-person` - 기도 인물 맞추기
- `card-sentence` - 카드 문장 연결하기

### 4. AI 멘토 대화 로그
- 사용자별 대화 기록 저장
- 페르소나 ID로 대화 맥락 구분

## ⚠️ 주의사항

### 1. 기존 데이터 보존
이미 데이터가 있는 데이터베이스에서는:
- `create table if not exists` 구문으로 인해 기존 데이터 보존
- 단, 구조가 변경된 경우에는 수동 수정 필요

### 2. RLS 정책 커스터마이징
운영 환경에서는 더 엄격한 정책 권장:
- 부서/반별로 데이터 접근 제한
- 교사는 자기 반 학생 데이터만 접근 등

### 3. 이메일 인증
Supabase Auth 설정 확인:
- Dashboard → Authentication → Settings
- "Enable email confirmation" 필요 여부 결정
- 즉시 로그인 테스트 시 비활성화 권장

## 🔄 재실행 방법

스키마를 다시 적용해야 할 경우:

1. **테이블 삭제 (경고!)**
   ```sql
   drop table if exists mentor_messages cascade;
   drop table if exists badges cascade;
   drop table if exists game_results cascade;
   drop table if exists meditations cascade;
   drop table if exists gratitude_notes cascade;
   drop table if exists prayer_notes cascade;
   drop table if exists profiles cascade;
   drop type if exists user_role;
   drop type if exists game_type;
   ```

2. **스키마 재실행**
   - `supabase/schema.sql` 내용 다시 실행

3. **트리거 재생성**
   - `handle_new_user()` 함수와 트리거 자동 재생성됨

## 📞 도움말

- **Supabase 문서**: https://supabase.com/docs
- **SQL 문법**: PostgreSQL 표준 사용
- **RLS 가이드**: https://supabase.com/docs/guides/auth/row-level-security

---

*스키마 적용 완료 후 `.env.local` 파일에 Supabase 정보를 입력하면 운영 모드가 활성화됩니다.*
