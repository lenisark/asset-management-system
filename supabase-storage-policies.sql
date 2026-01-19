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

-- 확인 쿼리
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
