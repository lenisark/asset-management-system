# 🚀 배포 및 운영 가이드

> 회사 자산관리 시스템 v2.1 - 배포부터 운영까지 완벽 가이드  
> 최종 업데이트: 2026-01-19

---

## 📑 목차

1. [사전 준비](#사전-준비)
2. [Step 1: Supabase 프로젝트 설정](#step-1-supabase-프로젝트-설정)
3. [Step 2: 데이터베이스 설정](#step-2-데이터베이스-설정)
4. [Step 3: Storage 설정](#step-3-storage-설정)
5. [Step 4: 로컬 환경 설정](#step-4-로컬-환경-설정)
6. [Step 5: 로컬 테스트](#step-5-로컬-테스트)
7. [Step 6: Vercel 배포](#step-6-vercel-배포)
8. [Step 7: 운영 및 모니터링](#step-7-운영-및-모니터링)
9. [트러블슈팅](#트러블슈팅)

---

## 사전 준비

### 필요한 계정
- [x] **Supabase 계정** (무료): https://supabase.com
- [x] **GitHub 계정** (무료): https://github.com
- [ ] **Vercel 계정** (무료, 선택): https://vercel.com

### 설치 확인
```bash
# Node.js 버전 확인 (18 이상 필요)
node --version
# 출력 예시: v20.x.x

# npm 버전 확인
npm --version
# 출력 예시: 10.x.x

# Git 버전 확인
git --version
# 출력 예시: git version 2.x.x
```

---

## Step 1: Supabase 프로젝트 설정

### 1.1 Supabase 회원가입 및 로그인

1. **웹사이트 접속**
   - https://supabase.com 접속
   - 우측 상단 "Start your project" 클릭

2. **회원가입**
   - GitHub 계정으로 로그인 (권장)
   - 또는 이메일로 가입

3. **조직 생성** (첫 로그인 시)
   - 조직명 입력 (예: "My Company")
   - Free Plan 선택

### 1.2 새 프로젝트 생성

1. **"New Project" 클릭**
   
2. **프로젝트 정보 입력**
   ```
   Name: asset-management-system
   Database Password: 강력한 비밀번호 생성 (저장 필수!)
   Region: Northeast Asia (Seoul) - 한국에서 가장 빠름
   Pricing Plan: Free (무료)
   ```

3. **"Create new project" 클릭**
   - 프로젝트 생성 완료까지 약 2분 소요

### 1.3 API 키 확인 및 저장

프로젝트 생성 완료 후:

1. **좌측 메뉴에서 "Project Settings" 클릭**

2. **"API" 탭 클릭**

3. **다음 정보 복사 및 저장**
   ```
   Project URL: https://abcdefghijklmnop.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```

   ⚠️ **중요**: 이 정보는 안전한 곳에 보관하세요!

---

## Step 2: 데이터베이스 설정

### 2.1 SQL Editor 접속

1. **좌측 메뉴에서 "SQL Editor" 클릭**

2. **"New query" 버튼 클릭**

### 2.2 데이터베이스 스키마 생성

#### 옵션 A: 새로 설치하는 경우 (권장)

1. **GitHub에서 스키마 파일 복사**
   - https://github.com/lenisark/asset-management-system/blob/main/supabase-schema.sql
   - 전체 내용 복사 (Ctrl+A → Ctrl+C)

2. **SQL Editor에 붙여넣기**

3. **우측 하단 "Run" 버튼 클릭** (또는 Ctrl+Enter)

4. **성공 메시지 확인**
   ```
   Success. No rows returned
   ```

#### 옵션 B: 기존 데이터베이스 업데이트

1. **업데이트 스크립트 복사**
   - https://github.com/lenisark/asset-management-system/blob/main/supabase-update.sql

2. **SQL Editor에 붙여넣기 및 실행**

#### 옵션 C: 유지보수 기능만 추가

1. **유지보수 스크립트 복사**
   - https://github.com/lenisark/asset-management-system/blob/main/supabase-maintenance-update.sql

2. **SQL Editor에 붙여넣기 및 실행**

### 2.3 테이블 생성 확인

1. **좌측 메뉴에서 "Table Editor" 클릭**

2. **다음 테이블이 생성되었는지 확인**
   - ✅ `assets` (자산 정보)
   - ✅ `transactions` (거래 내역)
   - ✅ `maintenance_schedules` (유지보수 스케줄)

3. **각 테이블 클릭하여 구조 확인**

### 2.4 샘플 데이터 삽입 (선택사항)

테스트를 위해 샘플 데이터를 넣고 싶다면:

```sql
-- SQL Editor에서 실행
INSERT INTO assets (
  id, name, category, serial_number, manufacturer, 
  purchase_date, purchase_price, status, location, notes
) VALUES
(
  gen_random_uuid(),
  'Dell OptiPlex 7090',
  'PC',
  'SN-PC-001',
  'Dell',
  '2024-01-15',
  1500000,
  'available',
  '본사 3층 개발팀',
  '개발용 PC'
),
(
  gen_random_uuid(),
  'LG 27인치 모니터',
  'Monitor',
  'SN-MON-001',
  'LG',
  '2024-01-20',
  350000,
  'available',
  '본사 3층 개발팀',
  '듀얼 모니터'
);
```

---

## Step 3: Storage 설정

자산 이미지 업로드를 위한 Storage 버킷 생성

### 3.1 Storage 버킷 생성

1. **좌측 메뉴에서 "Storage" 클릭**

2. **"Create a new bucket" 클릭**

3. **버킷 정보 입력**
   ```
   Name: asset-images
   Public bucket: ON (체크)
   File size limit: 5 MB
   Allowed MIME types: image/*
   ```

4. **"Create bucket" 클릭**

### 3.2 Storage 정책 설정

#### 방법 1: UI에서 설정 (권장)

1. **"asset-images" 버킷 클릭**

2. **"Policies" 탭 클릭**

3. **"New Policy" 클릭**

4. **"For full customization" 선택**

5. **정책 생성**

   **Policy 1: Public Read (읽기)**
   ```
   Policy name: Public read access
   Target roles: public
   Operations: SELECT
   Definition: true
   ```

   **Policy 2: Authenticated Upload (업로드)**
   ```
   Policy name: Authenticated upload
   Target roles: authenticated
   Operations: INSERT
   Definition: true
   ```

#### 방법 2: SQL로 설정

```sql
-- SQL Editor에서 실행
-- Public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'asset-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own uploads
CREATE POLICY "Users update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);

-- Users can delete their own uploads
CREATE POLICY "Users delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);
```

### 3.3 Storage 설정 확인

1. **테스트 이미지 업로드**
   - Storage → asset-images → "Upload file"
   - 아무 이미지나 업로드

2. **Public URL 확인**
   - 업로드된 파일 클릭
   - "Get URL" 클릭
   - URL이 정상적으로 복사되면 성공!

---

## Step 4: 로컬 환경 설정

### 4.1 프로젝트 클론

```bash
# 1. 저장소 클론
git clone https://github.com/lenisark/asset-management-system.git

# 2. 프로젝트 디렉토리 이동
cd asset-management-system

# 3. 의존성 설치
npm install
```

### 4.2 환경 변수 설정

```bash
# 1. .env 파일 생성
cp .env.example .env

# 2. .env 파일 편집
# Windows: notepad .env
# Mac/Linux: nano .env 또는 vim .env
```

**`.env` 파일 내용:**
```env
# Supabase 설정
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **주의사항**:
- `VITE_SUPABASE_URL`: Step 1.3에서 복사한 Project URL
- `VITE_SUPABASE_ANON_KEY`: Step 1.3에서 복사한 anon public key
- 값 양쪽에 따옴표 없이 그대로 붙여넣기
- 줄바꿈 없이 한 줄로 입력

### 4.3 환경 변수 확인

```bash
# 환경 변수가 제대로 로드되는지 확인
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 시:
- ❌ "Supabase URL이 설정되지 않았습니다" → `.env` 파일 다시 확인
- ✅ 로그인 페이지 표시 → 정상!

---

## Step 5: 로컬 테스트

### 5.1 개발 서버 시작

```bash
# 개발 서버 실행
npm run dev

# 출력:
# VITE v7.3.1  ready in 371 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.x.x:5173/
```

### 5.2 회원가입 및 로그인 테스트

1. **브라우저에서 `http://localhost:5173` 접속**

2. **회원가입**
   - "회원가입" 탭 클릭
   - 이메일 입력: `test@example.com`
   - 비밀번호 입력: `Test1234!` (8자 이상)
   - "회원가입" 버튼 클릭

3. **이메일 확인** (선택사항)
   - Supabase는 기본적으로 이메일 확인 필요
   - 테스트용으로 비활성화 가능:
     - Supabase → Authentication → Settings
     - "Enable email confirmations" OFF

4. **로그인**
   - 이메일/비밀번호 입력
   - "로그인" 버튼 클릭

### 5.3 주요 기능 테스트

#### ✅ 자산 등록
1. 우측 상단 "자산 등록" 클릭
2. 정보 입력:
   - 자산명: `테스트 노트북`
   - 카테고리: `PC`
   - 시리얼 번호: `TEST-001`
   - 제조사: `Dell`
   - 구매일: `2024-01-15`
   - 구매가격: `1500000`
   - 상태: `사용 가능`
   - 위치: `본사 3층`
3. 이미지 업로드 (선택)
4. "등록" 클릭

#### ✅ 대시보드 확인
- 통계 카드 확인 (총 자산, 사용 가능, 사용 중, 점검 중)
- 차트 표시 확인 (파이 차트, 바 차트)
- 최근 등록 자산 확인

#### ✅ 자산 목록
- 검색 기능 테스트
- 필터 기능 테스트 (카테고리, 상태)
- 자산 클릭하여 상세 정보 확인

#### ✅ 불출/입고
1. 자산 상세 페이지 열기
2. "불출/입고 등록" 클릭
3. 불출 등록:
   - 담당자: `홍길동`
   - 부서: `개발팀`
   - 날짜: `2024-01-20`
4. 이력에서 확인

#### ✅ QR 코드
1. 자산 상세 페이지 열기
2. "QR 코드" 버튼 클릭
3. QR 코드 생성 확인
4. 다운로드 테스트

#### ✅ Excel 기능
1. "Excel 내보내기" 클릭 → 파일 다운로드 확인
2. "템플릿 다운로드" 클릭 → 템플릿 확인
3. 템플릿 편집 후 "Excel 가져오기" 테스트

#### ✅ 유지보수 스케줄
1. 자산 상세 페이지 열기
2. 유지보수 섹션에서 "일정 등록" 클릭
3. 정보 입력:
   - 유형: `점검`
   - 예정일: `2024-02-01`
   - 담당자: `김철수`
   - 비용: `50000`
4. 등록 후 목록 확인

#### ✅ 감가상각 계산
1. 자산 상세 페이지 열기
2. "감가상각 계산" 버튼 클릭
3. 설정 조정:
   - 방법: `정액법`
   - 내용연수: `5년`
   - 잔존가치: 자동 계산
4. 연도별 스케줄 확인

#### ✅ 테마 전환
- 헤더 우측 달/해 아이콘 클릭
- 다크 모드 ↔ 라이트 모드 전환 확인

### 5.4 실시간 동기화 테스트

1. **두 개의 브라우저 창 열기**
   - Chrome: `http://localhost:5173`
   - Firefox (또는 Chrome 시크릿): `http://localhost:5173`

2. **동일 계정으로 로그인**

3. **한 쪽에서 자산 등록**
   - 다른 쪽에서 자동으로 목록 업데이트 확인
   - 실시간 동기화 아이콘 (Wifi) 확인

---

## Step 6: Vercel 배포

### 6.1 Vercel 계정 생성

1. **Vercel 웹사이트 접속**
   - https://vercel.com

2. **"Start Deploying" 클릭**

3. **GitHub 계정으로 로그인**

### 6.2 프로젝트 Import

1. **"New Project" 클릭**

2. **"Import Git Repository" 선택**

3. **GitHub 저장소 선택**
   - `lenisark/asset-management-system` 선택

4. **"Import" 클릭**

### 6.3 프로젝트 설정

1. **Project Name**
   ```
   asset-management-system
   ```

2. **Framework Preset**
   ```
   Vite (자동 감지됨)
   ```

3. **Root Directory**
   ```
   ./ (기본값)
   ```

4. **Build Command**
   ```
   npm run build
   ```

5. **Output Directory**
   ```
   dist
   ```

### 6.4 환경 변수 설정

1. **"Environment Variables" 섹션 펼치기**

2. **변수 추가**
   ```
   Name: VITE_SUPABASE_URL
   Value: https://abcdefghijklmnop.supabase.co
   
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **"Add" 버튼 클릭** (각 변수마다)

### 6.5 배포 시작

1. **"Deploy" 버튼 클릭**

2. **배포 진행 상황 확인**
   - Building... (약 1-2분)
   - Assigning Domain...
   - Deployment Ready!

3. **배포 완료**
   ```
   🎉 Congratulations!
   Your project is live at: https://asset-management-system.vercel.app
   ```

### 6.6 배포 확인

1. **배포된 URL 접속**
   - `https://asset-management-system.vercel.app`

2. **로그인 테스트**
   - 로컬에서 만든 계정으로 로그인

3. **모든 기능 테스트**
   - 자산 등록, 대시보드, Excel 등

### 6.7 커스텀 도메인 설정 (선택)

1. **Vercel 프로젝트 Settings → Domains**

2. **"Add Domain" 클릭**

3. **도메인 입력**
   ```
   example.com 또는 asset.example.com
   ```

4. **DNS 설정**
   - Vercel이 제공하는 DNS 레코드 추가
   - A Record 또는 CNAME 추가

5. **확인 완료**
   - 도메인으로 접속 가능

---

## Step 7: 운영 및 모니터링

### 7.1 Supabase 모니터링

#### 데이터베이스 사용량 확인

1. **Supabase → Home → Database**
   - Database Size: 500 MB / 500 MB (Free Plan)
   - Connection Pooling 사용 권장

2. **Table Editor에서 데이터 확인**
   - 정기적으로 데이터 백업

#### API 사용량 확인

1. **Supabase → Home → API**
   - API Requests: 제한 확인
   - Realtime Connections: 동시 접속자 수

#### Storage 사용량 확인

1. **Supabase → Storage**
   - 1 GB / 1 GB (Free Plan)
   - 정기적으로 불필요한 이미지 삭제

### 7.2 Vercel 모니터링

1. **프로젝트 대시보드**
   - Deployments: 배포 이력
   - Analytics: 방문자 통계 (Pro Plan)
   - Logs: 에러 로그 확인

2. **배포 이력 관리**
   - 이전 버전으로 롤백 가능
   - 각 커밋마다 자동 배포

### 7.3 정기 백업

#### 데이터베이스 백업

```bash
# 로컬에서 실행 (주 1회 권장)

# 1. Supabase CLI 설치
npm install -g supabase

# 2. 로그인
supabase login

# 3. 프로젝트 연결
supabase link --project-ref abcdefghijklmnop

# 4. 데이터베이스 백업
supabase db dump -f backup-$(date +%Y%m%d).sql
```

#### 수동 백업

1. **SQL Editor에서 실행**
```sql
-- 전체 데이터 조회 후 Excel로 저장
SELECT * FROM assets;
SELECT * FROM transactions;
SELECT * FROM maintenance_schedules;
```

2. **Excel 내보내기 기능 활용**
   - 앱에서 "Excel 내보내기" 정기 실행

### 7.4 사용자 관리

#### 사용자 목록 확인

1. **Supabase → Authentication → Users**
   - 전체 사용자 목록
   - 이메일 확인 상태
   - 마지막 로그인 시간

#### 사용자 비밀번호 재설정

1. **Authentication → Users**
2. **사용자 선택 → Send password reset email**

#### 사용자 삭제

1. **Authentication → Users**
2. **사용자 선택 → Delete user**

### 7.5 보안 설정

#### Row Level Security (RLS) 확인

```sql
-- SQL Editor에서 확인
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### API Key 재생성 (보안 사고 시)

1. **Supabase → Settings → API**
2. **"Reset Database Password" 또는 "Rotate JWT Secret"**
3. **환경 변수 업데이트 필요**

---

## 트러블슈팅

### 문제 1: "Supabase URL이 설정되지 않았습니다"

**원인**: 환경 변수가 로드되지 않음

**해결**:
```bash
# 1. .env 파일 확인
cat .env

# 2. 값이 제대로 입력되었는지 확인
# 양쪽에 따옴표 없어야 함!

# 3. 개발 서버 재시작
npm run dev
```

### 문제 2: 데이터베이스 연결 오류

**원인**: SQL 스키마 실행 실패

**해결**:
1. Supabase → SQL Editor
2. 다음 쿼리 실행하여 테이블 확인:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```
3. 테이블이 없으면 `supabase-schema.sql` 다시 실행

### 문제 3: 이미지 업로드 실패

**원인**: Storage 정책 설정 안 됨

**해결**:
1. Supabase → Storage → asset-images → Policies
2. Step 3.2의 정책 다시 생성
3. Public bucket 설정 확인

### 문제 4: 로그인 후 "403 Forbidden"

**원인**: RLS 정책 문제

**해결**:
```sql
-- SQL Editor에서 실행
-- 모든 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'assets';

-- 없으면 정책 재생성
DROP POLICY IF EXISTS "Enable read access for all users" ON assets;
CREATE POLICY "Enable read access for all users" ON assets
  FOR SELECT USING (true);
```

### 문제 5: Vercel 배포 실패

**원인**: 빌드 오류 또는 환경 변수 누락

**해결**:
1. Vercel 대시보드 → Deployments → 실패한 배포 클릭
2. Logs 확인
3. 환경 변수 다시 확인:
   - Settings → Environment Variables
   - 값이 제대로 입력되었는지 확인
4. "Redeploy" 클릭

### 문제 6: 실시간 동기화 안 됨

**원인**: Realtime 구독 설정 문제

**해결**:
1. Supabase → Settings → API → Realtime 확인
2. 개발자 도구 (F12) → Console 확인
3. 에러 메시지 확인 후 조치

---

## 📞 추가 지원

### 공식 문서
- **Supabase**: https://supabase.com/docs
- **Vite**: https://vitejs.dev/
- **Vercel**: https://vercel.com/docs

### GitHub Issues
- 버그 리포트: https://github.com/lenisark/asset-management-system/issues

---

## 🎉 축하합니다!

모든 설정이 완료되었습니다! 이제 회사 자산관리 시스템을 실제 운영 환경에서 사용할 수 있습니다.

**다음 단계**:
1. 팀원들에게 URL 공유
2. 회원가입 안내
3. 자산 등록 시작
4. 정기 백업 스케줄 설정

**운영 체크리스트**:
- [ ] 주 1회 데이터 백업
- [ ] 월 1회 Supabase 사용량 확인
- [ ] 분기 1회 사용자 정리
- [ ] 연 1회 비밀번호 정책 리뷰

**감사합니다!** 🚀
