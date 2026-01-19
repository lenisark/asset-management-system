# 🧹 Supabase Storage Policies 정리 가이드

> 이미지를 보니 정책이 많이 있는데, 자산관리 시스템에 필요한 정책만 남기고 정리하는 방법

---

## 📸 현재 상태

이미지에서 보이는 정책들:
- ❓ Authenticated delete 94kflh_0 (DELETE)
- ❓ Authenticated delete 94kflh_1 (SELECT) ← 이상함
- ❓ Authenticated update 94kflh_0 (UPDATE)
- ❓ Authenticated update 94kflh_1 (SELECT) ← 이상함
- ❓ Authenticated upload 94kflh_0 (INSERT)
- ❓ Authenticated users can upload (INSERT)
- ❓ Public Access (SELECT)
- ❓ Public read access 94kflh_0 (SELECT)
- ❓ Users can delete own uploads (DELETE)
- ❓ Users can update own uploads (UPDATE)

**문제점**:
1. 정책이 너무 많음 (10개)
2. 중복된 기능의 정책들
3. 이상한 이름 (94kflh_0, 94kflh_1)
4. `bucket_id = 'asset-images'` 조건이 있는지 확인 불가

---

## ✨ 해결 방법: 정책 정리 및 재생성

### Step 1: 기존 정책 모두 삭제

**SQL Editor**에서 실행:

```sql
-- ====================================
-- 모든 Storage 정책 삭제
-- ====================================

-- 기존 정책 전부 삭제
DROP POLICY IF EXISTS "Authenticated delete 94kflh_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete 94kflh_1" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update 94kflh_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update 94kflh_1" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload 94kflh_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access 94kflh_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;

-- 혹시 남아있을 수 있는 다른 정책들도 삭제
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;

-- 확인: 모든 정책 삭제 확인
SELECT policyname, roles, cmd
FROM pg_policies 
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;
```

**예상 결과**: 빈 테이블 (정책이 없음)

---

### Step 2: 필요한 정책만 깔끔하게 재생성

**SQL Editor**에서 실행:

```sql
-- ====================================
-- 자산관리 시스템용 Storage 정책 생성
-- asset-images 버킷 전용
-- ====================================

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

-- 확인: 정책 4개 생성 확인
SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;
```

**예상 결과**:
```
policyname              | roles            | cmd    | qual                                           | with_check
------------------------+------------------+--------+------------------------------------------------+------------
Authenticated delete    | {authenticated}  | DELETE | (bucket_id = 'asset-images'::text)             | NULL
Authenticated update    | {authenticated}  | UPDATE | (bucket_id = 'asset-images'::text)             | NULL
Authenticated upload    | {authenticated}  | INSERT | NULL                                           | (bucket_id = 'asset-images'::text) AND (auth.role() = 'authenticated'::text)
Public read access      | {public}         | SELECT | (bucket_id = 'asset-images'::text)             | NULL
```

---

### Step 3: 정책 테스트

#### 1. Policies 탭에서 확인
1. **Storage → asset-images → Policies**
2. **정확히 4개의 정책이 보여야 함**:
   - ✅ Public read access (SELECT)
   - ✅ Authenticated upload (INSERT)
   - ✅ Authenticated update (UPDATE)
   - ✅ Authenticated delete (DELETE)

#### 2. 이미지 업로드 테스트
1. **Storage → asset-images → Files**
2. **"Upload file" 클릭**
3. **이미지 선택하여 업로드**
4. ✅ **성공!**

#### 3. Public URL 테스트
1. **업로드된 파일 클릭**
2. **"Get URL" 클릭**
3. **URL을 새 탭에서 열기**
4. ✅ **이미지가 보이면 성공!**

#### 4. 앱에서 테스트
1. **자산관리 앱 로그인**
2. **"자산 등록" → 이미지 드래그 앤 드롭**
3. **미리보기 확인**
4. **등록 후 상세 페이지에서 이미지 표시 확인**
5. ✅ **완료!**

---

## 🤔 왜 이렇게 많은 정책이 있었나?

### 가능한 원인
1. **테스트 과정에서 여러 번 생성**
   - UI로 정책을 만들 때 실수로 여러 번 클릭
   - 다른 이름으로 중복 생성

2. **Supabase 자동 생성**
   - 일부 정책은 Supabase가 자동으로 생성했을 수 있음
   - "94kflh_0" 같은 이름은 자동 생성된 것

3. **다른 튜토리얼을 따라했을 때**
   - 다른 프로젝트의 정책을 그대로 복사했을 가능성

### 정리가 필요한 이유
- **중복 정책**: 같은 기능을 하는 정책이 여러 개
- **충돌 가능성**: 정책 간 충돌로 예상치 못한 동작
- **유지보수 어려움**: 어떤 정책이 활성화되어 있는지 파악 어려움
- **보안 취약점**: 불필요한 권한이 열려있을 수 있음

---

## ⚠️ 주의사항

### 정책 삭제 전 확인
```sql
-- 현재 정책 목록 확인
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

이 결과를 **스크린샷으로 저장**하거나 **텍스트로 복사**해두세요!

### 다른 버킷을 사용하는 경우
만약 `asset-images` 외에 다른 버킷(예: `avatars`, `documents`)도 사용한다면:

```sql
-- 다른 버킷용 정책도 필요
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 필요한 버킷별로 정책 추가
```

---

## 🎯 최종 체크리스트

- [ ] 기존 정책 목록 확인 (스크린샷/복사)
- [ ] Step 1: 모든 기존 정책 삭제
- [ ] 확인: 정책이 모두 삭제되었는지 확인
- [ ] Step 2: 필요한 정책 4개만 재생성
- [ ] 확인: 정확히 4개의 정책만 있는지 확인
- [ ] Step 3: 이미지 업로드 테스트
- [ ] Step 3: Public URL 접근 테스트
- [ ] Step 3: 앱에서 이미지 업로드 테스트
- [ ] ✅ 완료!

---

## 📚 참고

- **정책 생성 SQL**: [supabase-storage-policies.sql](../supabase-storage-policies.sql)
- **상세 가이드**: [STORAGE_POLICY_GUIDE.md](./STORAGE_POLICY_GUIDE.md)
- **빠른 가이드**: [STORAGE_POLICY_QUICKSTART.md](./STORAGE_POLICY_QUICKSTART.md)

---

**작성일**: 2026-01-19  
**버전**: 1.0  
**프로젝트**: 회사 자산관리 시스템 v2.1
