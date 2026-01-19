-- ====================================
-- Storage Policies 정리 및 재생성
-- 자산관리 시스템용
-- ====================================

-- Step 1: 기존 정책 모두 삭제
-- ====================================

-- Supabase UI로 생성된 자동 이름 정책들 삭제
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

-- 표준 이름 정책들도 삭제 (있다면)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;

-- 혹시 남아있을 수 있는 다른 변형들
DROP POLICY IF EXISTS "public read" ON storage.objects;
DROP POLICY IF EXISTS "authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "authenticated delete" ON storage.objects;

-- Step 2: 필요한 정책만 깔끔하게 재생성
-- ====================================

-- Policy 1: Public Read (모두가 이미지를 볼 수 있음)
-- asset-images 버킷의 모든 파일에 대해 SELECT 허용
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'asset-images');

-- Policy 2: Authenticated Upload (로그인한 사용자만 업로드)
-- asset-images 버킷에 authenticated 사용자만 INSERT 허용
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Authenticated Update (로그인한 사용자만 수정)
-- asset-images 버킷의 파일을 authenticated 사용자만 UPDATE 허용
CREATE POLICY "Authenticated update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Authenticated Delete (로그인한 사용자만 삭제)
-- asset-images 버킷의 파일을 authenticated 사용자만 DELETE 허용
CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'asset-images' 
  AND auth.role() = 'authenticated'
);

-- Step 3: 정책 확인
-- ====================================

-- 생성된 정책 확인 (정확히 4개여야 함)
SELECT 
  policyname AS "정책명",
  roles AS "대상 역할",
  cmd AS "작업",
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE '-'
  END AS "조건 (USING)",
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
    ELSE '-'
  END AS "조건 (WITH CHECK)"
FROM pg_policies 
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- 예상 결과:
-- 정책명               | 대상 역할         | 작업   | 조건 (USING)                                    | 조건 (WITH CHECK)
-- ---------------------+-------------------+--------+-------------------------------------------------+------------------
-- Authenticated delete | {authenticated}   | DELETE | USING: (bucket_id = 'asset-images'::text)      | -
-- Authenticated update | {authenticated}   | UPDATE | USING: (bucket_id = 'asset-images'::text)      | -
-- Authenticated upload | {authenticated}   | INSERT | -                                               | WITH CHECK: (bucket_id = 'asset-images'::text) AND (auth.role() = 'authenticated'::text)
-- Public read access   | {public}          | SELECT | USING: (bucket_id = 'asset-images'::text)      | -

-- ✅ 정책 4개가 정확히 생성되었다면 성공!
