# Supabase 정보 확인 가이드

이 가이드를 따라 Supabase 프로젝트의 정보를 확인하세요.

## 📋 단계별 절차

### 1단계: Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 로그인 (이미 계정이 있다고 확인됨)
3. 프로젝트 선택 (이미 프로젝트가 있다고 확인됨)

### 2단계: Project URL 및 API Key 확인

1. 왼쪽 메뉴에서 **⚙️ Settings** 클릭
2. 하위 메뉴에서 **API** 클릭
3. 다음 정보를 복사하세요:

#### 📋 복사할 정보

**Project URL:**
```
https://xxxxx.supabase.co
```
- 형식: `https://` + `프로젝트 ID` + `.supabase.co`
- 예시: `https://abcdefgh.supabase.co`

**anon public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Project API keys** 섹션에서 **`anon`** `public` 키 복사
- 주의: `service_role` 키가 아니라 `anon` `public` 키입니다!

### 3단계: 정보 보안

⚠️ **중요:** 이 정보는 민감한 정보입니다.
- 절대 GitHub 같은 공개 저장소에 커밋하지 마세요
- .env.local 파일에만 저장하세요
- .gitignore에 .env.local이 포함되어 있는지 확인하세요

### 4단계: 정보 제공

확인한 정보를 다음 형식으로 AI에게 제공하세요:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔍 스크린샷 참고

Supabase Dashboard → Settings → API 페이지에서 다음과 같은 위치를 찾으세요:

```
┌─────────────────────────────────────────┐
│  Project URL                              │
│  https://xxxxx.supabase.co     [Copy]   │
├─────────────────────────────────────────┤
│  Project API keys                        │
│  ┌─────────────────────────────────┐    │
│  │ anon public                    │    │
│  │ eyJhbGciOiJIUzI1NiIsInR...      │    │
│  │                        [Copy]  │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ service_role (secret)           │    │
│  │ eyJhbGciOiJIUzI1NiIsInR...      │    │
│  │                        [Copy]  │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## ❓ 자주 묻는 질문

**Q: `anon` 키와 `service_role` 키의 차이는?**
A: `anon` 키는 클라이언트(브라우저)에서 사용하고, `service_role` 키는 서버에서만 사용합니다. 우리는 `anon` 키가 필요합니다.

**Q: URL을 찾을 수 없어요**
A: Dashboard 메인 화면에서 프로젝트 카드를 클릭하면 프로젝트 URL을 볼 수 있습니다.

**Q: API Key를 다시 생성해야 하나요?**
A: 아니요, 기존 키를 그대로 사용하시면 됩니다. "Roll key" 버튼은 누르지 마세요 (키가 만료됩니다).

---

*가이드 준비 완료. 정보를 확인하신 후 AI에게 알려주세요.*
