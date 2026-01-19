# 회사 자산관리 시스템 (Supabase Full-Stack)

PC, 모니터, 키보드, 마우스 등 회사 IT 자산을 효율적으로 관리할 수 있는 풀스택 웹 애플리케이션입니다.
Supabase를 사용하여 실시간 데이터베이스, 인증, 파일 저장을 제공합니다.

## ✨ 주요 기능

### 🔐 1. 사용자 인증
- **이메일/비밀번호 로그인** 및 회원가입
- Supabase Auth 기반 보안 인증
- 세션 관리 및 자동 로그인 유지
- 사용자별 접근 제어
- 로그아웃 기능

### ⚡ 2. 실시간 동기화
- **Supabase Realtime** 구독
- 여러 사용자 동시 작업 지원
- 자산 변경 시 자동 업데이트
- 실시간 동기화 상태 표시

### 📊 3. 대시보드 & 차트
- 전체 자산 현황 통계
- **상태별 파이 차트** (사용가능, 사용중, 점검중)
- **카테고리별 바 차트** (PC, Monitor, etc)
- Chart.js 기반 인터랙티브 차트
- 최근 등록 자산 목록

### 📦 4. 자산 관리
- **자산 CRUD**: 등록, 조회, 수정, 삭제
- **자산 정보**:
  - 자산명, 카테고리, 시리얼 번호
  - 제조사, 구매일, 구매금액
  - 상태 (사용가능/사용중/점검중/폐기)
  - 위치, 비고
- **검색 및 필터링**:
  - 이름, 시리얼 번호, 제조사로 검색
  - 카테고리 및 상태별 필터

### 📸 5. 자산 사진 업로드
- **Supabase Storage** 연동
- 드래그앤드롭 이미지 업로드
- 이미지 미리보기
- 자산 상세 정보에서 이미지 표시
- PNG, JPG 지원 (최대 5MB)

### 📱 6. QR 코드 생성
- 각 자산에 대한 **QR 코드 자동 생성**
- QR 코드에 자산 정보 인코딩
- **다운로드** 및 **인쇄** 기능
- 라벨 인쇄용 포맷팅
- 모바일 스캔 지원

### 🔄 7. 불출/입고 관리
- **불출 등록**: 직원에게 자산 배정
  - 담당자명, 부서, 날짜 기록
  - 자동 상태 변경 (→ 사용중)
- **입고 등록**: 자산 반납 처리
  - 반납 정보 기록
  - 자동 상태 변경 (→ 사용가능)
- **이력 추적**: 각 자산별 완전한 이력 타임라인

### 🔍 8. 자산 상세 정보
- 전체 자산 정보 확인
- 자산 이미지 표시
- 불출/입고 이력 타임라인
- QR 코드 생성 버튼
- 이력에서 바로 불출/입고 등록

## 🛠️ 기술 스택

### Frontend
- **React 18** + TypeScript
- **Vite** (번들러)
- **Tailwind CSS** (스타일링)
- **Lucide React** (아이콘)
- **Chart.js** + react-chartjs-2 (차트)
- **QRCode** (QR 코드 생성)

### Backend (Supabase)
- **Supabase PostgreSQL** (데이터베이스)
- **Supabase Realtime** (실시간 동기화)
- **Supabase Auth** (사용자 인증)
- **Supabase Storage** (파일 저장)

## 🚀 시작하기

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn
- Supabase 계정

### 1. 프로젝트 클론
```bash
git clone https://github.com/lenisark/asset-management-system.git
cd asset-management-system
```

### 2. 의존성 설치
```bash
npm install
```

### 3. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입/로그인
2. 새 프로젝트 생성
3. 프로젝트 설정에서 API 정보 확인:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. 데이터베이스 스키마 생성

Supabase 대시보드 → SQL Editor에서 스크립트 실행

#### 🆕 처음 설치하는 경우
`supabase-schema.sql` 파일 내용을 복사하여 실행

```sql
-- assets 테이블, transactions 테이블, 인덱스, RLS 정책 등 생성
```

#### 🔄 기존 데이터베이스가 있는 경우
`supabase-update.sql` 파일 내용을 복사하여 실행

```sql
-- image_url 컬럼 추가 및 정책 업데이트
-- 기존 데이터는 유지됩니다
```

**⚠️ 주의**: 
- `supabase-schema.sql`: 전체 스키마 (처음 설치용)
- `supabase-update.sql`: 업데이트만 (기존 DB용)

**오류 해결**:
- "policy already exists" 오류가 나면 `supabase-update.sql` 사용
- 기존 정책을 자동으로 삭제하고 재생성합니다

### 5. Storage 버킷 생성

Supabase 대시보드 → Storage:

1. "New bucket" 클릭
2. 버킷 이름: `asset-images`
3. Public bucket: **ON**
4. File size limit: 5MB
5. Allowed MIME types: `image/*`

### 6. 환경 변수 설정

`.env` 파일 생성:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 7. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 8. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 📖 사용 방법

### 회원가입 및 로그인
1. 앱 실행 시 로그인 페이지 표시
2. 회원가입 또는 로그인
3. 이메일 인증 (선택사항)

### 자산 등록
1. 우측 상단 "자산 등록" 버튼
2. 자산 정보 입력
3. 이미지 업로드 (선택사항)
4. "등록" 버튼

### 자산 불출
1. 자산 목록에서 자산 선택 (눈 아이콘)
2. "불출/입고 등록" 버튼
3. "불출" 선택 후 담당자 정보 입력

### QR 코드 생성
1. 자산 상세 정보 열기
2. "QR 코드" 버튼 클릭
3. 다운로드 또는 인쇄

### 대시보드 확인
1. 상단 "대시보드" 탭
2. 통계 및 차트 확인

## 📁 프로젝트 구조

```
asset-management-system/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # 대시보드 (차트 포함)
│   │   ├── AssetList.tsx          # 자산 목록
│   │   ├── AssetForm.tsx          # 자산 등록/수정 (이미지 업로드)
│   │   ├── AssetDetail.tsx        # 자산 상세 정보
│   │   ├── TransactionForm.tsx    # 불출/입고 폼
│   │   ├── AuthPage.tsx           # 로그인/회원가입
│   │   └── QRCodeModal.tsx        # QR 코드 모달
│   ├── AuthContext.tsx            # 인증 컨텍스트
│   ├── supabaseClient.ts          # Supabase 클라이언트
│   ├── utils-supabase.ts          # Supabase CRUD 함수
│   ├── types.ts                   # TypeScript 타입
│   ├── App.tsx                    # 메인 앱
│   └── main.tsx                   # 엔트리 포인트
├── supabase-schema.sql            # DB 스키마
├── .env.example                   # 환경 변수 예제
├── package.json
└── README.md
```

## 🗄️ 데이터베이스 스키마

### `assets` 테이블
```sql
- id (UUID)               # 고유 ID
- name (TEXT)             # 자산명
- category (TEXT)         # 카테고리
- serial_number (TEXT)    # 시리얼 번호 (UNIQUE)
- manufacturer (TEXT)     # 제조사
- purchase_date (DATE)    # 구매일
- purchase_price (NUMERIC)# 구매금액
- status (TEXT)           # 상태
- location (TEXT)         # 위치
- notes (TEXT)            # 비고
- image_url (TEXT)        # 이미지 URL ⭐
- created_at (TIMESTAMP)  # 생성일
- updated_at (TIMESTAMP)  # 수정일
```

### `transactions` 테이블
```sql
- id (UUID)               # 고유 ID
- asset_id (UUID)         # 자산 ID (FK)
- type (TEXT)             # checkout/checkin
- employee_name (TEXT)    # 담당자명
- department (TEXT)       # 부서
- date (DATE)             # 거래일
- notes (TEXT)            # 비고
- created_at (TIMESTAMP)  # 생성일
```

## 🔐 보안 설정

### Row Level Security (RLS)
현재: **모든 사용자 읽기/쓰기 가능** (개발용)

실제 운영 환경 권장 설정:
```sql
-- 인증된 사용자만 접근
CREATE POLICY "Authenticated users only" ON assets
  FOR ALL USING (auth.role() = 'authenticated');
```

### Storage 정책
```sql
-- 공개 읽기, 인증된 사용자만 업로드
CREATE POLICY "Public read" ON storage.objects 
  FOR SELECT USING (bucket_id = 'asset-images');

CREATE POLICY "Authenticated upload" ON storage.objects 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 🎯 주요 개선 사항

### v2.0 (현재)
- ✅ 실시간 동기화
- ✅ 사용자 인증
- ✅ 이미지 업로드
- ✅ QR 코드 생성
- ✅ 대시보드 차트

### v1.0 (초기)
- ✅ 기본 CRUD
- ✅ 불출/입고 관리
- ✅ 이력 추적
- ✅ 검색 및 필터

## 🚧 향후 계획

- [ ] Excel 내보내기/가져오기
- [ ] 모바일 앱 (React Native)
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 자산 유지보수 스케줄
- [ ] 자산 감가상각 계산
- [ ] 이메일 알림
- [ ] 다국어 지원
- [ ] 테마 전환 (다크 모드)

## 📞 문의 및 지원

- **GitHub**: https://github.com/lenisark/asset-management-system
- **Issues**: 버그 리포트 및 기능 제안

## 📄 라이선스

MIT License

---

**Made with ❤️ by lenisark**
