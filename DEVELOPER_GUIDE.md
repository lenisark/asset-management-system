# 개발자 가이드 (DEVELOPER_GUIDE.md)

> 회사 자산관리 시스템 - 개발자를 위한 완전한 가이드  
> 최종 업데이트: 2026-01-19

---

## 📑 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처](#아키텍처)
3. [프로젝트 구조](#프로젝트-구조)
4. [기술 스택](#기술-스택)
5. [코드 컨벤션](#코드-컨벤션)
6. [개발 워크플로우](#개발-워크플로우)
7. [컴포넌트 가이드](#컴포넌트-가이드)
8. [데이터베이스 스키마](#데이터베이스-스키마)
9. [API 및 유틸리티](#api-및-유틸리티)
10. [테스트 가이드](#테스트-가이드)
11. [배포 가이드](#배포-가이드)
12. [트러블슈팅](#트러블슈팅)

---

## 프로젝트 개요

### 목적
회사의 IT 자산(PC, 모니터, 키보드 등)을 효율적으로 관리하고, 불출/입고 이력을 추적하며, 유지보수 스케줄을 관리하는 웹 애플리케이션

### 주요 기능
- 자산 CRUD (등록, 조회, 수정, 삭제)
- 실시간 동기화 (Supabase Realtime)
- 사용자 인증 (Supabase Auth)
- 자산 사진 업로드 (Supabase Storage)
- QR 코드 생성 및 인쇄
- Excel 내보내기/가져오기
- 불출/입고 관리
- 유지보수 스케줄 관리
- 대시보드 및 차트
- 다크/라이트 모드 테마

---

## 아키텍처

### 시스템 구조

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│      Frontend (React)           │
│  - Components                   │
│  - Context (Auth, Theme)        │
│  - Utils (Excel, Supabase)      │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│       Supabase Backend          │
│  - PostgreSQL Database          │
│  - Realtime Subscriptions       │
│  - Authentication               │
│  - Storage (Images)             │
└─────────────────────────────────┘
```

### 데이터 흐름

```
User Action → React Component → Utils Function → Supabase API → Database
                    ↑                                    ↓
                    └──────────── Realtime ──────────────┘
```

---

## 프로젝트 구조

```
asset-management-system/
├── src/
│   ├── components/               # React 컴포넌트
│   │   ├── AssetList.tsx         # 자산 목록 (검색/필터/Excel)
│   │   ├── AssetForm.tsx         # 자산 등록/수정 폼
│   │   ├── AssetDetail.tsx       # 자산 상세 정보
│   │   ├── Dashboard.tsx         # 대시보드 (차트)
│   │   ├── TransactionForm.tsx   # 불출/입고 폼
│   │   ├── AuthPage.tsx          # 로그인/회원가입
│   │   └── QRCodeModal.tsx       # QR 코드 생성
│   │
│   ├── AuthContext.tsx           # 인증 컨텍스트 (전역 상태)
│   ├── ThemeContext.tsx          # 테마 컨텍스트 (다크/라이트)
│   │
│   ├── types.ts                  # TypeScript 타입 정의
│   │
│   ├── supabaseClient.ts         # Supabase 클라이언트 설정
│   ├── utils-supabase.ts         # Supabase CRUD 함수
│   ├── utils-excel.ts            # Excel 내보내기/가져오기
│   ├── utils.ts                  # 일반 유틸리티 (로컬 스토리지)
│   │
│   ├── App.tsx                   # 메인 앱 컴포넌트
│   ├── main.tsx                  # 엔트리 포인트
│   └── index.css                 # 글로벌 스타일
│
├── supabase-schema.sql           # 초기 DB 스키마
├── supabase-update.sql           # DB 업데이트 스크립트
├── supabase-maintenance-update.sql # 유지보수 기능 추가
│
├── .env                          # 환경 변수 (로컬)
├── .env.example                  # 환경 변수 예제
├── package.json                  # npm 의존성
├── tsconfig.json                 # TypeScript 설정
├── vite.config.ts                # Vite 빌드 설정
├── tailwind.config.js            # Tailwind CSS 설정
├── postcss.config.js             # PostCSS 설정
└── README.md                     # 사용자 가이드
```

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2.0 | UI 라이브러리 |
| TypeScript | 5.9.3 | 타입 안전성 |
| Vite | 7.2.4 | 빌드 도구 |
| Tailwind CSS | 4.1.18 | 스타일링 |
| Lucide React | 0.562.0 | 아이콘 |
| Chart.js | 4.5.1 | 차트 라이브러리 |
| react-chartjs-2 | 5.3.1 | Chart.js React 래퍼 |
| xlsx | 0.18.5 | Excel 파일 처리 |
| qrcode | 1.5.4 | QR 코드 생성 |

### Backend (Supabase)
| 서비스 | 용도 |
|--------|------|
| PostgreSQL | 메인 데이터베이스 |
| Realtime | 실시간 동기화 |
| Auth | 사용자 인증 |
| Storage | 파일 저장 (이미지) |

---

## 코드 컨벤션

### TypeScript

#### 1. Import 규칙
```typescript
// ✅ 타입은 'import type' 사용 (verbatimModuleSyntax)
import type { Asset, Transaction } from './types';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// ❌ 타입과 값을 섞어서 import하지 않기
import { Asset, useState } from './types'; // 잘못됨
```

#### 2. 타입 정의
```typescript
// ✅ 명확한 타입 정의
interface AssetFormProps {
  asset?: Asset;
  onSave: (asset: Asset) => void;
  onCancel: () => void;
}

// ✅ Union 타입 활용
type AssetStatus = 'available' | 'in-use' | 'maintenance' | 'disposed';

// ❌ any 사용 금지
const data: any = fetchData(); // 잘못됨
```

#### 3. 함수 시그니처
```typescript
// ✅ 명시적인 반환 타입
export const getAssets = async (): Promise<Asset[]> => {
  // ...
};

// ✅ 에러 핸들링
try {
  const result = await someOperation();
  return result;
} catch (error) {
  console.error('Error in operation:', error);
  return null;
}
```

### React 컴포넌트

#### 1. 컴포넌트 구조
```typescript
import { useState, useEffect } from 'react';
import type { Asset } from '../types';

interface Props {
  // Props 타입 정의
}

const ComponentName = ({ prop1, prop2 }: Props) => {
  // 1. Hooks (useState, useEffect, useContext 등)
  const [state, setState] = useState<Type>(initialValue);
  
  // 2. 이벤트 핸들러
  const handleClick = () => {
    // ...
  };
  
  // 3. useEffect
  useEffect(() => {
    // ...
  }, [dependencies]);
  
  // 4. JSX 반환
  return (
    <div>
      {/* UI */}
    </div>
  );
};

export default ComponentName;
```

#### 2. 상태 관리
```typescript
// ✅ 구조화된 상태
const [formData, setFormData] = useState<FormData>({
  name: '',
  email: '',
  // ...
});

// ✅ 상태 업데이트
setFormData(prev => ({
  ...prev,
  name: newName,
}));

// ❌ 여러 개별 useState 남발
const [name, setName] = useState('');
const [email, setEmail] = useState('');
// ... (관련된 상태는 하나로 묶기)
```

### Supabase 함수

#### 1. CRUD 패턴
```typescript
// 조회
export const getAssets = async (): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from(TABLES.ASSETS)
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
  
  return mapDatabaseToAsset(data);
};

// 생성/수정
export const saveAsset = async (asset: Asset): Promise<boolean> => {
  const dbRecord = mapAssetToDatabase(asset);
  
  // 기존 데이터 확인
  const { data: existing } = await supabase
    .from(TABLES.ASSETS)
    .select('id')
    .eq('id', asset.id)
    .single();
  
  let error;
  if (existing) {
    // 업데이트
    const result = await supabase
      .from(TABLES.ASSETS)
      .update(dbRecord)
      .eq('id', asset.id);
    error = result.error;
  } else {
    // 신규 생성
    const result = await supabase
      .from(TABLES.ASSETS)
      .insert(dbRecord);
    error = result.error;
  }
  
  if (error) {
    console.error('Error saving asset:', error);
    return false;
  }
  
  return true;
};
```

#### 2. 데이터 매핑
```typescript
// snake_case (DB) ↔ camelCase (TypeScript) 변환
const mapDatabaseToAsset = (data: any[]): Asset[] => {
  return data.map(item => ({
    id: item.id,
    name: item.name,
    serialNumber: item.serial_number,  // DB: serial_number
    purchaseDate: item.purchase_date,   // DB: purchase_date
    createdAt: item.created_at,         // DB: created_at
    // ...
  }));
};
```

### 스타일링 (Tailwind CSS)

#### 1. 클래스 순서
```tsx
<div className="
  // 레이아웃
  flex items-center justify-between
  
  // 박스 모델
  p-4 m-2
  
  // 배경/테두리
  bg-white dark:bg-gray-800
  border border-gray-300
  rounded-lg
  
  // 텍스트
  text-gray-900 dark:text-white
  font-medium
  
  // 효과
  shadow-md
  hover:shadow-lg
  transition-colors
">
```

#### 2. 다크 모드 대응
```tsx
// ✅ 다크 모드 클래스 항상 함께 정의
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

// ✅ 조건부 다크 모드
<button className={`
  px-4 py-2
  ${isDanger 
    ? 'bg-red-500 dark:bg-red-600' 
    : 'bg-blue-500 dark:bg-blue-600'
  }
`}>
```

---

## 개발 워크플로우

### 1. 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/lenisark/asset-management-system.git
cd asset-management-system

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 수정 (Supabase URL, Key 입력)

# 4. Supabase 스키마 실행
# Supabase 대시보드에서 supabase-schema.sql 실행

# 5. 개발 서버 시작
npm run dev
```

### 2. 기능 개발 프로세스

#### Step 1: 기능 계획
1. 요구사항 분석
2. 데이터 모델 설계 (필요 시)
3. UI/UX 스케치
4. API 엔드포인트 설계

#### Step 2: 데이터베이스 (필요 시)
```sql
-- 1. 테이블 생성 (supabase-schema.sql)
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY,
  -- columns
);

-- 2. 인덱스 생성
CREATE INDEX idx_new_table_column ON new_table(column);

-- 3. RLS 정책
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy_name" ON new_table FOR ALL USING (true);
```

#### Step 3: 타입 정의
```typescript
// src/types.ts
export interface NewFeature {
  id: string;
  name: string;
  // ...
  createdAt: string;
  updatedAt: string;
}
```

#### Step 4: API 함수
```typescript
// src/utils-supabase.ts
export const getNewFeatures = async (): Promise<NewFeature[]> => {
  // 구현
};

export const saveNewFeature = async (item: NewFeature): Promise<boolean> => {
  // 구현
};
```

#### Step 5: 컴포넌트 개발
```typescript
// src/components/NewFeature.tsx
import type { NewFeature } from '../types';

const NewFeatureComponent = () => {
  // 구현
};

export default NewFeatureComponent;
```

#### Step 6: 통합
```typescript
// src/App.tsx 또는 부모 컴포넌트
import NewFeatureComponent from './components/NewFeature';

// 통합 로직
```

### 3. Git 워크플로우

```bash
# 1. 새 브랜치 생성
git checkout -b feature/new-feature-name

# 2. 개발 및 커밋
git add .
git commit -m "feat: Add new feature description

- 상세 설명 1
- 상세 설명 2"

# 3. 푸시
git push origin feature/new-feature-name

# 4. Pull Request 생성 (GitHub)
# main 브랜치로 PR 생성

# 5. 리뷰 및 머지 후
git checkout main
git pull origin main
```

### 4. 커밋 메시지 컨벤션

```
타입(범위): 제목

상세 설명

Refs: #이슈번호
```

**타입:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 (포맷팅, 세미콜론 등)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

**예시:**
```
feat(asset): Excel 내보내기 기능 추가

- exportAssetsToExcel 함수 구현
- AssetList에 Excel 다운로드 버튼 추가
- xlsx 라이브러리 통합

Refs: #123
```

---

## 컴포넌트 가이드

### 컴포넌트 분류

#### 1. 페이지 컴포넌트
- **Dashboard**: 통계 및 차트 표시
- **AssetList**: 자산 목록 및 검색/필터
- **AuthPage**: 로그인/회원가입

#### 2. 폼 컴포넌트
- **AssetForm**: 자산 등록/수정
- **TransactionForm**: 불출/입고 등록

#### 3. 모달 컴포넌트
- **AssetDetail**: 자산 상세 정보
- **QRCodeModal**: QR 코드 생성/다운로드

#### 4. 컨텍스트
- **AuthContext**: 인증 상태 관리
- **ThemeContext**: 테마 상태 관리

### 컴포넌트 Props 가이드

#### AssetList
```typescript
interface AssetListProps {
  assets: Asset[];           // 자산 목록
  onEdit: (asset: Asset) => void;       // 수정 핸들러
  onDelete: (id: string) => void;       // 삭제 핸들러
  onView: (asset: Asset) => void;       // 상세보기 핸들러
  onReload?: () => void;                // 목록 새로고침 (Excel 가져오기 후)
}
```

#### AssetForm
```typescript
interface AssetFormProps {
  asset?: Asset;             // 수정 시 기존 자산 (없으면 신규)
  onSave: (asset: Asset) => void;       // 저장 핸들러
  onCancel: () => void;                 // 취소 핸들러
}
```

---

## 데이터베이스 스키마

### 테이블 관계도

```
┌─────────────┐        ┌──────────────────┐
│   assets    │◄───────│   transactions   │
│             │1     ∞ │                  │
│ - id (PK)   │        │ - asset_id (FK)  │
└─────────────┘        └──────────────────┘
       ▲
       │
       │1
       │
       │∞
┌──────────────────────┐
│ maintenance_schedules│
│                      │
│ - asset_id (FK)      │
└──────────────────────┘
```

### 테이블 상세

#### assets
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- 'PC', 'Monitor', etc.
  serial_number TEXT NOT NULL UNIQUE,
  manufacturer TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC NOT NULL,
  status TEXT NOT NULL,    -- 'available', 'in-use', etc.
  location TEXT NOT NULL,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,      -- 'checkout', 'checkin'
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### maintenance_schedules
```sql
CREATE TABLE maintenance_schedules (
  id UUID PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,      -- 'inspection', 'repair', etc.
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT NOT NULL,    -- 'scheduled', 'completed', etc.
  assigned_to TEXT,
  notes TEXT,
  cost NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## API 및 유틸리티

### Supabase API

#### 자산 관리
```typescript
getAssets(): Promise<Asset[]>
getAssetById(id: string): Promise<Asset | null>
saveAsset(asset: Asset): Promise<boolean>
deleteAsset(id: string): Promise<boolean>
```

#### 거래 관리
```typescript
saveTransaction(transaction: Transaction): Promise<boolean>
getTransactionsByAssetId(assetId: string): Promise<Transaction[]>
```

#### 유지보수 스케줄
```typescript
getMaintenanceSchedules(): Promise<MaintenanceSchedule[]>
getMaintenanceSchedulesByAssetId(assetId: string): Promise<MaintenanceSchedule[]>
saveMaintenanceSchedule(schedule: MaintenanceSchedule): Promise<boolean>
deleteMaintenanceSchedule(id: string): Promise<boolean>
```

#### 파일 업로드
```typescript
uploadAssetImage(file: File, assetId: string): Promise<string | null>
deleteAssetImage(imageUrl: string): Promise<boolean>
```

### Excel 유틸리티

```typescript
exportAssetsToExcel(assets: Asset[]): boolean
exportTransactionsToExcel(transactions: Transaction[]): boolean
downloadAssetTemplate(): boolean
importAssetsFromExcel(file: File): Promise<{
  success: boolean;
  imported: number;
  errors: string[];
}>
```

---

## 테스트 가이드

### 수동 테스트 체크리스트

#### 인증
- [ ] 회원가입
- [ ] 로그인
- [ ] 로그아웃
- [ ] 세션 유지

#### 자산 관리
- [ ] 자산 등록 (이미지 포함)
- [ ] 자산 목록 조회
- [ ] 자산 검색/필터
- [ ] 자산 수정
- [ ] 자산 삭제

#### Excel 기능
- [ ] Excel 내보내기
- [ ] 템플릿 다운로드
- [ ] Excel 가져오기
- [ ] 유효성 검사 확인

#### 불출/입고
- [ ] 불출 등록
- [ ] 입고 등록
- [ ] 이력 확인

#### 기타
- [ ] QR 코드 생성
- [ ] 테마 전환
- [ ] 실시간 동기화
- [ ] 반응형 UI (모바일)

---

## 배포 가이드

### 프로덕션 빌드

```bash
# 1. 빌드
npm run build

# 2. 빌드 확인
npm run preview

# 3. dist/ 폴더 배포
```

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 설정 (Vercel)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 트러블슈팅

### 빌드 오류

#### 1. TypeScript 타입 오류
```
error TS1484: 'Asset' is a type and must be imported using a type-only import
```
**해결:**
```typescript
// ❌ 잘못된 방법
import { Asset } from './types';

// ✅ 올바른 방법
import type { Asset } from './types';
```

#### 2. Tailwind PostCSS 오류
```
[postcss] It looks like you're trying to use `tailwindcss` directly
```
**해결:**
```bash
npm install @tailwindcss/postcss --save-dev
```

postcss.config.js:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### Supabase 연결 오류

#### 1. 환경 변수 누락
**증상:** "Supabase URL이 설정되지 않았습니다"  
**해결:** `.env` 파일 확인
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. RLS 정책 오류
**증상:** 데이터 조회 안 됨  
**해결:** SQL Editor에서 정책 확인
```sql
SELECT * FROM pg_policies WHERE tablename = 'assets';
```

### Excel 기능 오류

#### 1. 가져오기 실패
**증상:** "파일 읽기 실패"  
**해결:**
- 파일 형식 확인 (.xlsx, .xls)
- 템플릿 형식 준수 확인
- 필수 컬럼 누락 확인

---

## 추가 개발 시 체크리스트

### 새 기능 추가 시

- [ ] `types.ts`에 타입 정의 추가
- [ ] `supabase-schema.sql` 업데이트 (DB 변경 시)
- [ ] `utils-supabase.ts`에 API 함수 추가
- [ ] 컴포넌트 개발 (Props 인터페이스 정의)
- [ ] 다크 모드 스타일 적용
- [ ] 반응형 디자인 확인
- [ ] TypeScript 컴파일 오류 확인
- [ ] 프로덕션 빌드 테스트
- [ ] Git 커밋 (컨벤션 준수)
- [ ] README.md 업데이트
- [ ] 이 문서 업데이트

---

## 참고 자료

- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Supabase 문서](https://supabase.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Vite 가이드](https://vite.dev/guide/)

---

**최종 업데이트:** 2026-01-19  
**작성자:** lenisark  
**버전:** v2.1
