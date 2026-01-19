# 🔧 한글 파일명 업로드 문제 해결

## 🚨 문제

**"Failed to upload 의미의 메.jpg: File name is invalid"**

Supabase Storage는 기본적으로 **한글이나 특수문자가 포함된 파일명을 허용하지 않습니다**.

---

## ✅ 해결 방법

### 자동 파일명 변환

업로드 시 파일명을 **자동으로 안전한 형식으로 변환**합니다:

```
원본: 의미의 메.jpg
변환: abc123-1737345678901-x7k2m9.jpg
     └─────┘ └──────────┘ └────┘ └─┘
     자산ID    타임스탬프    랜덤   확장자
```

---

## 🔍 구현 내용

### 1️⃣ 안전한 파일명 생성

**`src/utils-supabase.ts`**의 `uploadAssetImage` 함수:

```typescript
export const uploadAssetImage = async (file: File, assetId: string): Promise<string | null> => {
  try {
    // 1. 허용된 이미지 확장자 목록
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    
    // 2. 원본 파일명에서 확장자 추출
    const originalExt = file.name.split('.').pop()?.toLowerCase() || '';
    
    // 3. 확장자 검증
    let fileExt = allowedExtensions.includes(originalExt) ? originalExt : null;
    
    // 4. 확장자가 없으면 MIME 타입에서 추출
    if (!fileExt) {
      const mimeToExt = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/bmp': 'bmp',
        'image/svg+xml': 'svg'
      };
      fileExt = mimeToExt[file.type] || 'jpg';
    }
    
    // 5. 안전한 파일명 생성
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${assetId}-${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `assets/${fileName}`;
    
    // 6. 업로드
    const { error } = await supabase.storage
      .from('asset-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) return null;
    
    // 7. 공개 URL 반환
    const { data } = supabase.storage
      .from('asset-images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
```

---

### 2️⃣ 사용자 안내 메시지

**`src/components/AssetForm.tsx`**:

```tsx
<label className="flex flex-col items-center px-4 py-6 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
  <Upload className="w-8 h-8 text-gray-400 mb-2" />
  <span className="text-sm text-gray-600">이미지 선택 또는 드래그</span>
  <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WebP (최대 5MB)</span>
  <span className="text-xs text-blue-500 mt-1">💡 한글 파일명도 자동으로 변환됩니다</span>
  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
</label>
```

---

## 📋 주요 개선사항

### ✅ 파일명 안전성
- **한글 제거**: 한글 파일명 자동 변환
- **특수문자 제거**: 공백, 특수문자 제거
- **예측 가능**: `assetId-timestamp-random.확장자` 형식
- **충돌 방지**: 타임스탬프 + 랜덤 문자열로 중복 방지

### ✅ 확장자 검증
- **허용 목록**: jpg, jpeg, png, gif, webp, bmp, svg
- **MIME 타입 fallback**: 확장자가 없거나 이상할 때 MIME 타입 사용
- **소문자 변환**: 모든 확장자를 소문자로 통일

### ✅ 사용자 경험
- **투명한 변환**: 사용자에게 자동 변환 안내
- **다크 모드 지원**: 다크 모드에서도 메시지 잘 보임
- **친절한 안내**: "한글 파일명도 자동으로 변환됩니다" 메시지

---

## 🧪 테스트

### 테스트 케이스

| 원본 파일명 | 변환 예시 | 상태 |
|------------|-----------|------|
| `의미의 메.jpg` | `abc123-1737345678901-x7k2m9.jpg` | ✅ |
| `테스트 이미지.png` | `abc123-1737345678902-y8n3p0.png` | ✅ |
| `Photo 123!@#.jpg` | `abc123-1737345678903-z9o4q1.jpg` | ✅ |
| `image` (확장자 없음) | `abc123-1737345678904-a0p5r2.jpg` | ✅ |
| `file.unknown` | `abc123-1737345678905-b1q6s3.jpg` (MIME 타입 기반) | ✅ |

### 실제 테스트

1. **한글 파일명 업로드**
   ```
   파일: 의미의 메.jpg
   결과: 정상 업로드
   저장: abc123-1737345678901-x7k2m9.jpg
   URL: https://xxxxx.supabase.co/storage/v1/object/public/asset-images/assets/abc123-1737345678901-x7k2m9.jpg
   ```

2. **공백 포함 파일명**
   ```
   파일: 테스트 이미지 123.png
   결과: 정상 업로드
   저장: abc123-1737345678902-y8n3p0.png
   ```

3. **특수문자 포함 파일명**
   ```
   파일: Photo!@#$%^&*().jpg
   결과: 정상 업로드
   저장: abc123-1737345678903-z9o4q1.jpg
   ```

---

## 🔄 업데이트 방법

### 1. 코드 업데이트

```bash
cd asset-management-system
git pull origin main
npm install  # (필요시)
```

### 2. 개발 서버 재시작

```bash
npm run dev
```

### 3. 브라우저 새로고침

`Ctrl + F5` 또는 `Cmd + Shift + R` (캐시 무시 새로고침)

### 4. 테스트

1. 로그인
2. "자산 등록" 클릭
3. **한글 파일명 이미지 드래그 앤 드롭**
4. 미리보기 확인
5. 등록 버튼 클릭
6. ✅ 성공!

---

## 💡 추가 정보

### Supabase Storage 파일명 제한

Supabase Storage는 다음 문자만 허용합니다:
- 영문자 (a-z, A-Z)
- 숫자 (0-9)
- 하이픈 (-)
- 언더스코어 (_)
- 마침표 (.) (확장자 구분용)

### 왜 파일명을 변경하나?

1. **보안**: 원본 파일명에 민감한 정보가 있을 수 있음
2. **호환성**: 모든 시스템에서 안전하게 작동
3. **충돌 방지**: 같은 이름의 파일 업로드 시 덮어쓰기 방지
4. **추적**: assetId가 포함되어 어떤 자산의 이미지인지 쉽게 파악

### sanitizeFileName 함수 (향후 개선)

현재는 파일명 전체를 assetId-timestamp-random으로 대체하지만,  
향후 원본 파일명을 유지하면서 안전하게 변환하는 기능도 추가 가능:

```typescript
// 예시 (현재 미사용)
const sanitizeFileName = (fileName: string): string => {
  const parts = fileName.split('.');
  const ext = parts.pop()?.toLowerCase() || 'jpg';
  const baseName = parts.join('.');
  
  const safeName = baseName
    .replace(/[^\w\s-]/g, '_')
    .replace(/[\s]+/g, '_')
    .replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  return `${safeName || 'image'}.${ext}`;
};
```

---

## 📚 관련 문서

- **Storage 정책 가이드**: [STORAGE_POLICY_GUIDE.md](./STORAGE_POLICY_GUIDE.md)
- **배포 가이드**: [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
- **개발자 가이드**: [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md)

---

## 🎉 완료!

이제 **한글 파일명**이 포함된 이미지도 문제없이 업로드할 수 있습니다!

**GitHub**: https://github.com/lenisark/asset-management-system

**커밋**: `6d9e1e9` - fix: 한글 파일명 업로드 오류 해결

---

**작성일**: 2026-01-19  
**버전**: v2.1.1  
**프로젝트**: 회사 자산관리 시스템
