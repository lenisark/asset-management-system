# ⚡ Supabase Storage Policies 빠른 설정 가이드

> **질문**: 이미지를 보니 Policies 탭이 비어있는데, 어떻게 설정하나요?

---

## 🎯 답변: 두 가지 방법이 있습니다!

### 방법 1: SQL로 설정 (추천! 빠르고 정확)

1. **Supabase 대시보드 → SQL Editor**
2. **"New query" 클릭**
3. **아래 SQL 전체 복사 후 붙여넣기**
4. **"Run" 클릭** (Ctrl + Enter)

```sql
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

5. **성공 메시지 확인**: `Success. No rows returned`

✅ **완료!** 이제 Storage → asset-images → Policies 탭에서 4개의 정책이 보입니다.

---

### 방법 2: UI로 설정 (초보자용)

#### Step 1: 첫 번째 정책 - Public Read

1. **"New Policy" 버튼 클릭** (우측 상단)
2. **"For full customization" 선택**
3. **입력**:
   ```
   Policy name: Public read access
   Target roles: public
   Allowed operation: SELECT (체크)
   Policy definition: bucket_id = 'asset-images'
   ```
4. **"Review" → "Save policy"**

#### Step 2: 두 번째 정책 - Authenticated Upload

1. **다시 "New Policy" 클릭**
2. **"For full customization" 선택**
3. **입력**:
   ```
   Policy name: Authenticated upload
   Target roles: authenticated
   Allowed operation: INSERT (체크)
   WITH CHECK: bucket_id = 'asset-images' AND auth.role() = 'authenticated'
   ```
4. **"Review" → "Save policy"**

#### Step 3, 4: 나머지 정책 (선택사항)

같은 방식으로:
- **Authenticated update** (UPDATE)
- **Authenticated delete** (DELETE)

---

## ✅ 정책 설정 확인

### SQL로 확인
```sql
SELECT 
  policyname, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;
```

**예상 결과**:
```
Authenticated delete    {authenticated}    DELETE
Authenticated update    {authenticated}    UPDATE
Authenticated upload    {authenticated}    INSERT
Public read access      {public}           SELECT
```

### UI로 확인
1. **Storage → asset-images → Policies 탭**
2. **4개의 정책이 표시되어야 함**

---

## 🧪 테스트

### 1. 이미지 업로드 테스트
1. Storage → asset-images → Files
2. "Upload file" 클릭
3. 이미지 선택하여 업로드
4. ✅ 성공!

### 2. Public URL 테스트
1. 업로드된 파일 클릭
2. "Get URL" 클릭
3. URL을 새 탭에서 열기
4. ✅ 이미지가 보이면 성공!

### 3. 앱에서 테스트
1. 자산관리 앱 로그인
2. "자산 등록" → 이미지 드래그 앤 드롭
3. 미리보기 확인
4. 등록 후 상세 페이지에서 이미지 표시
5. ✅ 완료!

---

## 🚨 문제 해결

### "new row violates row-level security policy"
→ 정책이 없거나 잘못 설정됨  
→ **해결**: 위 SQL 전체 다시 실행

### 이미지 업로드는 되는데 조회 안 됨
→ Public Read 정책이 없음  
→ **해결**: Public read access 정책 추가

### 로그인했는데 업로드 안 됨
→ Authenticated Upload 정책이 없음  
→ **해결**: Authenticated upload 정책 추가

---

## 📚 더 자세한 가이드

- **[STORAGE_POLICY_GUIDE.md](./docs/STORAGE_POLICY_GUIDE.md)** - 전체 가이드
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - 배포 가이드
- **supabase-storage-policies.sql** - SQL 스크립트

---

## 🎉 완료!

이제 자산관리 시스템에서 이미지를 자유롭게 업로드하고 조회할 수 있습니다!

**다음 단계**:
1. ✅ Storage 정책 설정 완료
2. ✅ 테스트 이미지 업로드
3. ✅ 앱에서 자산 등록 (이미지 포함)
4. ✅ 모든 기능 정상 작동 확인

**질문이 있으시면 GitHub Issues로 문의해주세요!**  
https://github.com/lenisark/asset-management-system/issues
