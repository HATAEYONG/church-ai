# Vercel 배포 및 GitHub 연동 가이드

이 가이드를 따라 에이맨(A-Men) 프로젝트를 Vercel에 배포하고 GitHub와 연동하세요.

## 🎯 배포 상황

- **배포 URL**: https://church-ai-rho.vercel.app/
- **GitHub 리포지토리**: https://github.com/HATAEYONG/church-ai.git
- **현재 상태**: GitHub에 코드 반영 완료 ✅

## 📋 Vercel-GitHub 연동 절차

### 1단계: Vercel Dashboard 접속

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard 접속
   - 로그인 (GitHub 계정으로 로그인 권장)

2. **프로젝트 확인**
   - `church-ai` 프로젝트 찾기
   - 이미 배포된 프로젝트가 있을 수 있습니다

### 2단계: GitHub Import 설정

#### 방법 A: 기존 프로젝트가 있는 경우

1. **프로젝트 설정 진입**
   - Vercel Dashboard에서 `church-ai` 프로젝트 클릭
   - **Settings** 탭 클릭

2. **Git 연동**
   - **Git** 섹션 찾기
   - **"Connected Git Repository"** 확인
   - 연결되어 있지 않으면 **"Connect to Git"** 클릭

3. **GitHub 리포지토리 선택**
   - `HATAEYONG/church-ai` 리포지토리 선택
   - **"Connect"** 버튼 클릭

#### 방법 B: 새 프로젝트인 경우

1. **새 프로젝트 생성**
   - Vercel Dashboard에서 **"Add New Project"** 클릭
   - **"Continue with GitHub"** 클릭

2. **리포지토리 Import**
   - `HATAEYONG/church-ai` 리포지토리 찾기
   - **"Import"** 버튼 클릭

### 3단계: 프로젝트 설정

#### 프레임워크 설정

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### 환경 변수 설정

**Environment Variables** 섹션에 다음 변수들 추가:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

# Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key-here
ANTHROPIC_MODEL=claude-opus-4-8

# ElevenLabs API
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
```

⚠️ **중요**:
- 모든 환경 변수는 **Production** 및 **Preview** 환경에 모두 추가
- `NEXT_PUBLIC_*`로 시작하는 변수만 클라이언트에서 접근 가능
- API Key는 보안을 위해 Vercel Dashboard에서만 관리

### 4단계: 배포

1. **수동 배포**
   - **Deployments** 탭 클릭
   - **"Redeploy"** 버튼 클릭
   - 또는 **"Deploy to Production"** 클릭

2. **자동 배포 확인**
   - GitHub 리포지토리에 변경 사항 push 시 자동 배포
   - Vercel Dashboard → **Deployments**에서 배포 상태 확인

## 🔧 Vercel 설정 세부사항

### Build Output Settings

**vercel.json** 파일 생성 (프로젝트 루트):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["hnd1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "ANTHROPIC_API_KEY": "@anthropic-api-key",
    "ELEVENLABS_API_KEY": "@elevenlabs-api-key"
  }
}
```

### domains 설정 (선택사항)

도메인이 있는 경우:
1. **Settings** → **Domains**
2. 도메인 입력 (예: church-ai.example.com)
3. DNS 설정 안내 따르기

## 🚀 자동 배포 확인

### GitHub → Vercel 자동 배포 흐름

```
1. 로컬에서 코드 수정
   ↓
2. git add .
   ↓
3. git commit -m "메시지"
   ↓
4. git push origin master
   ↓
5. Vercel 자동 감지 (약 1분 내)
   ↓
6. 자동 빌드 시작
   ↓
7. 배포 완료 (3-5분)
   ↓
8. https://church-ai-rho.vercel.app/ 업데이트
```

### 배포 상태 확인

1. Vercel Dashboard → **Deployments**
2. 최신 배포 상태 확인
3. **Build Log**에서 빌드 과정 확인
4. **Deploy Log**에서 배포 과정 확인

## ⚠️ 일반적인 문제 해결

### 문제 1: 빌드 실패

**원인**: 의존성 문제 또는 환경 변수 미설정

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 문제 없으면 Vercel 환경 변수 확인
# Vercel Dashboard → Settings → Environment Variables
```

### 문제 2: 환경 변수 작동 안 함

**원인**: 환경 변수가 Production에만 설정되고 Preview/Development에 없음

**해결**:
- 모든 환경(Production, Preview, Development)에 환경 변수 추가
- `NEXT_PUBLIC_*` 형식 확인

### 문제 3: API Key 노출

**원인**: 환경 변수가 아닌 코드에 직접 입력

**해결**:
- 절대 코드에 API Key 직접 입력 금지
- 모든 키는 환경 변수로만 관리
- `.env.local`은 `.gitignore`에 포함

### 문제 4: 배포 후 404 에러

**원인**: Next.js App Router 라우팅 문제

**해결**:
```typescript
// src/middleware.ts 확인
export { config } from 'https://cdn.jsdelivr.net/npm/next/dist/server/config.js'
```

## 📊 배포 체크리스트

### 배포 전
- [ ] GitHub에 최신 코드 반영
- [ ] 로컬에서 `npm run build` 성공
- [ ] 환경 변수 모두 설정
- [ ] `.gitignore`에 `.env.local` 포함

### 배포 후
- [ ] https://church-ai-rho.vercel.app/ 접속 가능
- [ ] 메인 페이지 정상 로딩
- [ ] 주요 기능 작동 (기도, 감사, 게임 등)
- [ ] API 연결 상태 (Supabase, Claude, ElevenLabs)

## 🔄 지속적 배포 (CI/CD)

### GitHub Actions와 Vercel 연동 (선택사항)

`.github/workflows/deploy.yml` 파일:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 도움말

- **Vercel 문서**: https://vercel.com/docs
- **Vercel GitHub 통합**: https://vercel.com/docs/deployments/git/vercel-ci
- **Next.js 배포**: https://nextjs.org/docs/deployment

---

*Vercel과 GitHub 연동으로 자동 배포를 설정하세요! 🚀*
