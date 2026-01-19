# 📸 Supabase Storage Policies 설정 가이드

> 자산관리 시스템의 이미지 업로드/조회를 위한 Storage 정책 설정 방법

---

## 📋 목차

1. [개요](#개요)
2. [UI로 정책 설정하기](#ui로-정책-설정하기)
3. [SQL로 정책 설정하기](#sql로-정책-설정하기)
4. [정책 확인 및 테스트](#정책-확인-및-테스트)
5. [트러블슈팅](#트러블슈팅)

---

## 개요

### 왜 Storage Policies가 필요한가?

Supabase는 기본적으로 **Row Level Security (RLS)**를 사용하여 모든 데이터 접근을 제어합니다. Storage도 마찬가지로 정책을 설정해야만 파일을 업로드하고 조회할 수 있습니다.

### 필요한 정책 4가지

| 정책 | 대상 | 작업 | 설명 |
|------|------|------|------|
| **Public Read** | 모든 사용자 (public) | SELECT | 누구나 이미지를 볼 수 있음 |
| **Authenticated Upload** | 로그인한 사용자 | INSERT | 로그인한 사용자만 업로드 가능 |
| **Authenticated Update** | 로그인한 사용자 | UPDATE | 로그인한 사용자만 수정 가능 |
| **Authenticated Delete** | 로그인한 사용자 | DELETE | 로그인한 사용자만 삭제 가능 |

---

## UI로 정책 설정하기

### 📍 현재 상태

제공하신 이미지를 보면:
- **Policies 탭**이 열려 있음
- **정책이 하나도 없는 상태** (빈 화면)
- **"New Policy" 버튼**이 우측 상단에 보임

### 단계별 설정

#### Step 1: 첫 번째 정책 - Public Read

1. **"New Policy" 버튼 클릭** (우측 상단)

2. **정책 템플릿 선택**
   - 팝업이 뜨면 **"For full customization"** 선택
   - (또는 "Get started quickly" → "Allow public access"도 가능)

3. **정책 정보 입력**
   
   | 필드 | 값 |
   |------|-----|
   | **Policy name** | `Public read access` |
   | **Target roles** | `public` (드롭다운 선택) |
   | **Allowed operation** | `SELECT` (체크박스) |
   | **Policy definition (USING)** | `bucket_id = 'asset-images'` |

4. **"Review" 클릭 → "Save policy" 클릭**

#### Step 2: 두 번째 정책 - Authenticated Upload

1. **다시 "New Policy" 버튼 클릭**

2. **"For full customization" 선택**

3. **정책 정보 입력**
   
   | 필드 | 값 |
   |------|-----|
   | **Policy name** | `Authenticated upload` |
   | **Target roles** | `authenticated` (드롭다운 선택) |
   | **Allowed operation** | `INSERT` (체크박스) |
   | **WITH CHECK** | `bucket_id = 'asset-images' AND auth.role() = 'authenticated'` |

4. **"Review" 클릭 → "Save policy" 클릭**

#### Step 3: 세 번째 정책 - Authenticated Update (선택사항)

1. **"New Policy" 버튼 클릭**

2. **정책 정보 입력**
   
   | 필드 | 값 |
   |------|-----|
   | **Policy name** | `Authenticated update` |
   | **Target roles** | `authenticated` |
   | **Allowed operation** | `UPDATE` |
   | **Policy definition** | `auth.role() = 'authenticated'` |

3. **저장**

#### Step 4: 네 번째 정책 - Authenticated Delete (선택사항)

1. **"New Policy" 버튼 클릭**

2. **정책 정보 입력**
   
   | 필드 | 값 |
   |------|-----|
   | **Policy name** | `Authenticated delete` |
   | **Target roles** | `authenticated` |
   | **Allowed operation** | `DELETE` |
   | **Policy definition** | `auth.role() = 'authenticated'` |

3. **저장**

---

## SQL로 정책 설정하기

UI 방식보다 **빠르고 정확**합니다! (추천)

### 단계

1. **Supabase 대시보드에서 "SQL Editor" 클릭** (좌측 메뉴)

2. **"New query" 버튼 클릭**

3. **아래 SQL 전체 복사 후 붙여넣기**

```sql
-- ====================================
-- Supabase Storage Policies
-- asset-images 버킷에 대한 정책 설정
-- ====================================

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;

-- Policy 1: Public Read (모두가 이미지를 볼 수 있음)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'asset-images');

-- Policy 2: Authenticated Upload (로그인한 사용자만 업로드)
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Authenticated Update (로그인한 사용자만 수정)
CREATE POLICY "Authenticated update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Authenticated Delete (로그인한 사용자만 삭제)
CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);
```

4. **"Run" 버튼 클릭** (우측 하단, 또는 `Ctrl + Enter`)

5. **성공 메시지 확인**
   ```
   Success. No rows returned
   ```

---

## 정책 확인 및 테스트

### 1. 정책 생성 확인

SQL Editor에서 다음 쿼리 실행:

```sql
SELECT 
  policyname, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;
```

**예상 결과**:

| policyname | roles | cmd |
|------------|-------|-----|
| Authenticated delete | {authenticated} | DELETE |
| Authenticated update | {authenticated} | UPDATE |
| Authenticated upload | {authenticated} | INSERT |
| Public read access | {public} | SELECT |

### 2. Storage에서 확인

1. **Storage → asset-images → Policies 탭**
2. **4개의 정책이 보여야 함**

### 3. 이미지 업로드 테스트

1. **Storage → asset-images → Files 탭**
2. **"Upload file" 클릭**
3. **아무 이미지나 선택하여 업로드**
4. **업로드 성공 확인**

### 4. Public URL 테스트

1. **업로드된 파일 클릭**
2. **"Get URL" 클릭**
3. **URL 복사**
4. **새 브라우저 탭에서 URL 열기**
5. **이미지가 보이면 성공!**

### 5. 앱에서 테스트

1. **자산관리 앱에서 로그인**
2. **"자산 등록" 클릭**
3. **이미지 파일 드래그 앤 드롭**
4. **미리보기 확인**
5. **등록 후 상세 페이지에서 이미지 표시 확인**

---

## 트러블슈팅

### 문제 1: "new row violates row-level security policy"

**원인**: 정책이 설정되지 않았거나 잘못 설정됨

**해결**:
1. Storage → asset-images → Policies 확인
2. 정책이 없으면 다시 생성
3. SQL 방식으로 재설정 (위 SQL 전체 실행)

### 문제 2: 이미지 업로드는 되는데 조회가 안 됨

**원인**: Public Read 정책이 없음

**해결**:
```sql
-- SQL Editor에서 실행
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'asset-images');
```

### 문제 3: 로그인했는데 업로드가 안 됨

**원인**: Authenticated Upload 정책이 없음

**해결**:
```sql
-- SQL Editor에서 실행
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);
```

### 문제 4: "Policy already exists"

**원인**: 정책이 이미 존재함

**해결**:
```sql
-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;

-- 그리고 다시 생성
CREATE POLICY "Public read access"...
```

### 문제 5: Public bucket인데도 403 Forbidden

**원인**: 
1. Public bucket 설정이 안 됨
2. 정책이 잘못 설정됨

**해결**:
1. Storage → asset-images → Configuration 확인
   - "Public bucket" 토글 ON
2. 정책 재설정 (위 SQL 실행)
3. Supabase 프로젝트 재시작 (필요시)

---

## 📝 참고사항

### Policy Definition 문법

#### USING vs WITH CHECK

- **USING**: 읽기/수정/삭제 시 조건 검사
- **WITH CHECK**: 삽입 시 조건 검사

#### auth.role()

- `'public'`: 로그인하지 않은 모든 사용자
- `'authenticated'`: 로그인한 사용자
- `'anon'`: 익명 사용자 (anon key 사용)
- `'service_role'`: 서비스 역할 (service_role key 사용)

#### bucket_id

- `bucket_id = 'asset-images'`: asset-images 버킷에만 적용
- 여러 버킷을 사용하는 경우 각각 정책 필요

### 보안 권장사항

1. **Public Read는 필요한 경우만**
   - 민감한 문서는 Public Read 제거
   - 대신 Authenticated Read 사용

2. **파일 크기 제한**
   - 버킷 설정에서 File size limit 설정 (예: 5 MB)

3. **MIME 타입 제한**
   - Allowed MIME types: `image/*` 또는 `image/png, image/jpeg`

4. **정기 점검**
   - 불필요한 파일 삭제
   - 사용량 모니터링 (Free plan: 1 GB)

---

## 🎯 빠른 체크리스트

- [ ] Supabase → Storage → asset-images 생성
- [ ] Public bucket: ON
- [ ] File size limit: 5 MB
- [ ] Policies 탭으로 이동
- [ ] SQL Editor에서 정책 SQL 실행
- [ ] 정책 4개 생성 확인
- [ ] 테스트 이미지 업로드
- [ ] Public URL 접근 확인
- [ ] 앱에서 이미지 업로드 테스트

---

## 📚 추가 리소스

- **Supabase Storage 공식 문서**: https://supabase.com/docs/guides/storage
- **Storage Policies 가이드**: https://supabase.com/docs/guides/storage/security/access-control
- **Row Level Security**: https://supabase.com/docs/guides/database/postgres/row-level-security

---

**작성일**: 2026-01-19  
**버전**: 1.0  
**프로젝트**: 회사 자산관리 시스템 v2.1
