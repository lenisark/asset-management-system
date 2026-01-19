# 회사 자산관리 시스템 v2.2 (Supabase Full-Stack)

PC, 모니터, 키보드, 마우스 등 회사 IT 자산을 효율적으로 관리할 수 있는 풀스택 웹 애플리케이션입니다.
Supabase를 사용하여 실시간 데이터베이스, 인증, 파일 저장을 제공합니다.

**✨ 최신 업데이트 (v2.2)**: 
- 🔔 실시간 알림 시스템
- 🔍 고급 검색 및 필터링
- 📊 향상된 대시보드 (자산 가치 추이, 월별 구매 금액 그래프)
- 🌓 완전한 다크 모드 지원

## ✨ 주요 기능

### 🔐 1. 사용자 인증
- **이메일/비밀번호 로그인** 및 회원가입
- Supabase Auth 기반 보안 인증
- 세션 관리 및 자동 로그인 유지
- 사용자별 접근 제어
- 로그아웃 기능

### 🎨 2. 테마 전환
- **다크/라이트 모드** 지원
- 사용자 설정 localStorage 저장
- 전체 UI에 일관된 테마 적용
- 부드러운 전환 애니메이션

### ⚡ 3. 실시간 동기화
- **Supabase Realtime** 구독
- 여러 사용자 동시 작업 지원
- 자산 변경 시 자동 업데이트
- 실시간 동기화 상태 표시

### 📊 4. 대시보드 & 차트
- **통계 카드**: 전체 자산 현황 (전체, 사용가능, 사용중, 점검중)
- **Chart.js 차트**:
  - 상태별 파이 차트 (사용가능, 사용중, 점검중)
  - 카테고리별 바 차트 (PC, Monitor, etc)
- **Recharts 고급 그래프** (NEW!):
  - 📈 **자산 가치 추이** (Line Chart) - 감가상각 반영
  - 📊 **월별 구매 금액** (Bar Chart) - 최근 12개월
- 최근 등록 자산 목록
- 완전한 다크 모드 지원

### 📦 5. 자산 관리
- **자산 CRUD**: 등록, 조회, 수정, 삭제
- **자산 정보**:
  - 자산명, 카테고리, 시리얼 번호
  - 제조사, 구매일, 구매금액
  - 상태 (사용가능/사용중/점검중/폐기)
  - 위치, 비고
- **고급 검색 및 필터링** (NEW!):
  - 🔍 **전체 텍스트 검색**: 이름, 시리얼 번호, 제조사
  - 📂 **카테고리 필터**: PC, Monitor, Keyboard, Mouse, Other
  - 🎯 **상태 필터**: 사용가능, 사용중, 점검중, 폐기
  - 💰 **가격 범위 필터**: 최소/최대 금액
  - 📅 **구매 기간 필터**: 시작일 ~ 종료일
  - 📍 **위치 필터**: 특정 위치 검색
  - 📊 **필터 결과 표시**: 활성 필터 및 검색 결과 수
- 다크 모드 완전 지원

### 📸 6. 자산 사진 업로드
- **Supabase Storage** 연동
- 드래그앤드롭 이미지 업로드
- 이미지 미리보기
- 자산 상세 정보에서 이미지 표시
- PNG, JPG 지원 (최대 5MB)
- **한글 파일명 지원** (NEW!) - 자동으로 안전한 파일명으로 변환

### 📱 7. QR 코드 생성
- 각 자산에 대한 **QR 코드 자동 생성**
- QR 코드에 자산 정보 인코딩
- **다운로드** 및 **인쇄** 기능
- 라벨 인쇄용 포맷팅
- 모바일 스캔 지원

### 📊 8. Excel 내보내기/가져오기
- **Excel 내보내기**:
  - 자산 목록을 Excel 파일로 다운로드
  - 거래 내역 Excel 내보내기
  - 필터링된 목록도 내보내기 지원
- **Excel 가져오기**:
  - Excel 파일에서 대량 자산 등록
  - 템플릿 파일 제공
  - 유효성 검사 (필수 필드, 중복 체크)
  - 오류 리포트 제공

### 🔄 9. 불출/입고 관리
- **불출 등록**: 직원에게 자산 배정
  - 담당자명, 부서, 날짜 기록
  - 자동 상태 변경 (→ 사용중)
- **입고 등록**: 자산 반납 처리
  - 반납 정보 기록
  - 자동 상태 변경 (→ 사용가능)
- **이력 추적**: 각 자산별 완전한 이력 타임라인

### 🛠️ 10. 유지보수 스케줄 관리
- **유지보수 일정 등록**:
  - 점검, 수리, 청소, 업그레이드 등 유형 분류
  - 예정일, 담당자, 비용 기록
- **스케줄 상태 관리**:
  - 예정됨, 진행중, 완료, 취소 상태 관리
  - 완료일 자동 기록
- **자산별 이력 조회**:
  - 각 자산의 유지보수 이력 타임라인
  - 비용 통계 및 분석
- **알림 기능**: 예정된 유지보수 일정 표시

### 🔔 11. 실시간 알림 시스템 (NEW!)
- **실시간 알림**:
  - Supabase Realtime 구독으로 즉시 알림 수신
  - 읽음/안읽음 상태 관리
- **알림 유형**:
  - 유지보수 일정 알림 (3일 전, 1일 전)
  - 자산 변경 알림
  - 시스템 알림
- **알림 UI**:
  - 헤더의 벨 아이콘에 미읽음 배지 표시
  - 드롭다운으로 알림 목록 확인
  - 개별 알림 읽음 처리
  - 전체 알림 읽음 처리
  - 개별 알림 삭제
- 다크 모드 지원

### 💰 12. 자산 감가상각 계산 (준비중)
- **정액법 / 정률법** 감가상각 계산
- 내용연수 및 잔존가치 설정
- 연도별 감가상각비 자동 계산
- 현재 자산 가치 추정
- 회계 리포트 생성

### 🔍 13. 자산 상세 정보
- 전체 자산 정보 확인
- 자산 이미지 표시
- 불출/입고 이력 타임라인
- 유지보수 이력 타임라인
- QR 코드 생성 버튼
- 이력에서 바로 불출/입고 등록
- 완전한 다크 모드 지원

## 🛠️ 기술 스택

### Frontend
- **React 19** + TypeScript
- **Vite 7** (번들러)
- **Tailwind CSS 4** (스타일링, 다크 모드)
- **Lucide React** (아이콘)
- **Chart.js 4** + react-chartjs-2 (기본 차트)
- **Recharts 3** (고급 그래프 - NEW!)
- **QRCode** (QR 코드 생성)
- **XLSX** (SheetJS) (Excel 내보내기/가져오기)

### Backend (Supabase)
- **Supabase PostgreSQL** (데이터베이스)
- **Supabase Realtime** (실시간 동기화, 알림)
- **Supabase Auth** (사용자 인증)
- **Supabase Storage** (파일 저장)

### 코드 통계
- **총 코드 라인**: ~4,878줄 (TypeScript/React)
- **컴포넌트**: 13개
- **유틸리티 함수**: 5개 모듈
- **SQL 스크립트**: 6개

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
-- assets 테이블, transactions 테이블, maintenance_schedules 테이블, 인덱스, RLS 정책 등 생성
```

#### 🔔 알림 시스템 추가 (필수!)
`supabase-notifications.sql` 파일 내용을 복사하여 실행

```sql
-- notifications 테이블, 인덱스, RLS 정책, 유틸리티 함수 생성
```

#### 🔄 기존 데이터베이스가 있는 경우 (v1.x → v2.0)
`supabase-update.sql` 파일 내용을 복사하여 실행

```sql
-- image_url 컬럼 추가 및 정책 업데이트
-- 기존 데이터는 유지됩니다
```

#### 🛠️ 유지보수 스케줄 기능만 추가하는 경우
`supabase-maintenance-update.sql` 파일 내용을 복사하여 실행

```sql
-- maintenance_schedules 테이블 생성 및 RLS 정책 설정
```

**⚠️ 주의**: 
- `supabase-schema.sql`: 전체 스키마 (처음 설치용)
- `supabase-notifications.sql`: 알림 시스템 (필수!)
- `supabase-update.sql`: 업데이트만 (기존 DB용)

**오류 해결**:
- "policy already exists" 오류가 나면 `supabase-update.sql` 사용
- 기존 정책을 자동으로 삭제하고 재생성합니다

### 5. Storage 버킷 생성 및 정책 설정

Supabase 대시보드 → Storage:

1. **버킷 생성**
   - "New bucket" 클릭
   - 버킷 이름: `asset-images`
   - Public bucket: **ON**
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

2. **Storage 정책 설정** (⚠️ 필수!)
   
   **방법 1: SQL로 설정 (추천)**
   - SQL Editor에서 `supabase-storage-policies.sql` 실행
   
   **방법 2: UI로 설정**
   - Storage → asset-images → Policies → "New Policy"
   - [📸 상세 설정 가이드 보기](./docs/STORAGE_POLICY_GUIDE.md)

   필수 정책 4개:
   - ✅ Public Read (모두가 이미지 조회 가능)
   - ✅ Authenticated Upload (로그인 사용자만 업로드)
   - ✅ Authenticated Update (로그인 사용자만 수정)
   - ✅ Authenticated Delete (로그인 사용자만 삭제)

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

### 테마 전환
- 헤더 우측의 **달/해 아이콘** 클릭
- 다크 모드 ↔ 라이트 모드 전환
- 설정은 자동 저장됩니다

### 자산 등록
1. 우측 상단 "자산 등록" 버튼
2. 자산 정보 입력
3. 이미지 업로드 (선택사항)
4. "등록" 버튼

### Excel로 대량 등록
1. "템플릿 다운로드" 버튼으로 템플릿 받기
2. Excel에서 자산 정보 입력
3. "Excel 가져오기" 버튼으로 업로드
4. 유효성 검사 후 자동 등록

### 자산 내보내기
- "Excel 내보내기" 버튼으로 현재 목록 다운로드
- 필터링된 목록도 내보내기 가능

### 자산 불출
1. 자산 목록에서 자산 선택 (눈 아이콘)
2. "불출/입고 등록" 버튼
3. "불출" 선택 후 담당자 정보 입력

### QR 코드 생성
1. 자산 상세 정보 열기
2. "QR 코드" 버튼 클릭
3. 다운로드 또는 인쇄

### 유지보수 스케줄 등록 (NEW!)
1. 자산 상세 정보 → "유지보수 예약" 버튼
2. 유형(점검/수리/청소/업그레이드) 선택
3. 예정일, 담당자, 비용 입력
4. 상태 관리 (예정됨 → 진행중 → 완료)

### 대시보드 확인
1. 상단 "대시보드" 탭
2. 통계 및 차트 확인
3. 최근 등록 자산 확인

## 📁 프로젝트 구조

```
asset-management-system/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx               # 대시보드 (Chart.js + Recharts)
│   │   ├── AssetList.tsx               # 자산 목록 (검색/필터)
│   │   ├── AssetForm.tsx               # 자산 등록/수정 (이미지 업로드)
│   │   ├── AssetDetail.tsx             # 자산 상세 정보
│   │   ├── TransactionForm.tsx         # 불출/입고 폼
│   │   ├── MaintenanceForm.tsx         # 유지보수 스케줄 폼
│   │   ├── DepreciationCalculator.tsx  # 감가상각 계산기
│   │   ├── NotificationBell.tsx        # 알림 벨 (NEW!)
│   │   ├── QRCodeModal.tsx             # QR 코드 모달
│   │   └── AuthPage.tsx                # 로그인/회원가입
│   ├── hooks/
│   │   └── useNotifications.ts         # 알림 커스텀 훅 (NEW!)
│   ├── AuthContext.tsx                 # 인증 컨텍스트
│   ├── ThemeContext.tsx                # 테마 컨텍스트
│   ├── supabaseClient.ts               # Supabase 클라이언트
│   ├── utils-supabase.ts               # Supabase CRUD 함수
│   ├── utils-excel.ts                  # Excel 내보내기/가져오기
│   ├── utils-dashboard.ts              # 대시보드 데이터 계산 (NEW!)
│   ├── utils-depreciation.ts           # 감가상각 계산
│   ├── types.ts                        # TypeScript 타입
│   ├── App.tsx                         # 메인 앱
│   └── main.tsx                        # 엔트리 포인트
├── docs/                               # 문서 폴더 (NEW!)
│   ├── NOTIFICATION_SYSTEM_COMPLETE.md # 알림 시스템 완료 보고서
│   ├── DASHBOARD_IMPROVEMENT_COMPLETE.md # 대시보드 개선 완료 보고서
│   ├── FUTURE_ROADMAP.md               # 향후 개발 로드맵
│   ├── KOREAN_FILENAME_FIX.md          # 한글 파일명 문제 해결
│   ├── STORAGE_POLICY_GUIDE.md         # Storage 정책 가이드
│   ├── STORAGE_POLICY_QUICKSTART.md    # Storage 빠른 설정
│   └── STORAGE_POLICY_CLEANUP.md       # Storage 정책 정리
├── supabase-schema.sql                 # DB 스키마 (전체)
├── supabase-notifications.sql          # 알림 시스템 스키마 (NEW!)
├── supabase-update.sql                 # DB 업데이트 스크립트
├── supabase-maintenance-update.sql     # 유지보수 기능 추가
├── supabase-storage-policies.sql       # Storage 정책 설정 (필수!)
├── DEPLOYMENT_GUIDE.md                 # 배포 가이드
├── DEVELOPER_GUIDE.md                  # 개발자 가이드
├── .env.example                        # 환경 변수 예제
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
- image_url (TEXT)        # 이미지 URL
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

### `notifications` 테이블 ⭐ NEW!
```sql
- id (UUID)               # 고유 ID
- user_id (UUID)          # 사용자 ID (FK → auth.users)
- type (TEXT)             # maintenance/asset/system
- title (TEXT)            # 알림 제목
- message (TEXT)          # 알림 내용
- asset_id (UUID)         # 관련 자산 ID (FK, 선택사항)
- read (BOOLEAN)          # 읽음 여부
- created_at (TIMESTAMP)  # 생성일
```
```sql
- id (UUID)               # 고유 ID
- asset_id (UUID)         # 자산 ID (FK)
- type (TEXT)             # inspection/repair/cleaning/upgrade/other
- scheduled_date (DATE)   # 예정일
- completed_date (DATE)   # 완료일
- status (TEXT)           # scheduled/in-progress/completed/cancelled
- assigned_to (TEXT)      # 담당자
- notes (TEXT)            # 비고
- cost (NUMERIC)          # 비용
- created_at (TIMESTAMP)  # 생성일
- updated_at (TIMESTAMP)  # 수정일
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

### v2.2 (2026-01-19) 🆕 최신!
- ✅ **실시간 알림 시스템** (유지보수 일정, 자산 변경 알림)
- ✅ **고급 검색 및 필터링** (가격 범위, 구매 기간, 위치 등)
- ✅ **대시보드 고급 그래프** (Recharts)
  - 자산 가치 추이 (감가상각 반영)
  - 월별 구매 금액 그래프
- ✅ **완전한 다크 모드 지원** (모든 컴포넌트)
- ✅ **한글 파일명 업로드 지원**

### v2.1 (2026-01-19)
- ✅ **테마 전환** (다크/라이트 모드)
- ✅ **Excel 내보내기/가져오기** (대량 자산 등록)
- ✅ **유지보수 스케줄 관리** (점검, 수리, 청소, 업그레이드)
- ✅ 감가상각 계산 인터페이스 (준비중)

### v2.0 (2026-01)
- ✅ 실시간 동기화
- ✅ 사용자 인증
- ✅ 이미지 업로드
- ✅ QR 코드 생성
- ✅ 대시보드 차트

### v1.0 (2026-01 초기)
- ✅ 기본 CRUD
- ✅ 불출/입고 관리
- ✅ 이력 추적
- ✅ 검색 및 필터

## 🚧 향후 계획

### 🔜 진행 중 (v2.3)
- [ ] **PDF 보고서 생성** (자산 목록, 감가상각 회계 보고서)
- [ ] **권한 관리** (관리자/일반 사용자 구분)
- [ ] **모바일 최적화** (반응형 레이아웃, PWA)
- [ ] **QR/바코드 스캔** (모바일 카메라 지원)

### 📋 계획됨 (v3.0)
- [ ] 자산 대여/반납 관리
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 이메일 알림 (예정된 유지보수, 점검 알림)
- [ ] 다국어 지원 (영어, 일본어)
- [ ] ERP 시스템 연동 (API)
- [ ] AI 기능 (자산 가치 예측, 교체 시기 추천)

**자세한 로드맵**: [FUTURE_ROADMAP.md](./docs/FUTURE_ROADMAP.md)

## 📞 문의 및 지원

- **GitHub**: https://github.com/lenisark/asset-management-system
- **Issues**: 버그 리포트 및 기능 제안

## 📚 문서

### 🚀 배포 가이드
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Supabase 설정부터 Vercel 배포까지 완벽 가이드

### 👨‍💻 개발자 가이드
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - 아키텍처, 코드 컨벤션, 개발 워크플로우

### 📸 Storage 설정 가이드
- **[STORAGE_POLICY_GUIDE.md](./docs/STORAGE_POLICY_GUIDE.md)** - Supabase Storage Policies 설정 방법 (이미지 업로드/조회)
- **[STORAGE_POLICY_QUICKSTART.md](./docs/STORAGE_POLICY_QUICKSTART.md)** - 빠른 설정 가이드
- **[STORAGE_POLICY_CLEANUP.md](./docs/STORAGE_POLICY_CLEANUP.md)** - Storage 정책 정리 방법

### 🔔 기능 완료 보고서
- **[NOTIFICATION_SYSTEM_COMPLETE.md](./docs/NOTIFICATION_SYSTEM_COMPLETE.md)** - 알림 시스템 구현 보고서
- **[DASHBOARD_IMPROVEMENT_COMPLETE.md](./docs/DASHBOARD_IMPROVEMENT_COMPLETE.md)** - 대시보드 개선 보고서
- **[KOREAN_FILENAME_FIX.md](./docs/KOREAN_FILENAME_FIX.md)** - 한글 파일명 업로드 문제 해결

### 🗺️ 로드맵
- **[FUTURE_ROADMAP.md](./docs/FUTURE_ROADMAP.md)** - 향후 개발 계획 및 우선순위

### 📝 SQL 스크립트
- **supabase-schema.sql** - 전체 데이터베이스 스키마 (처음 설치용)
- **supabase-notifications.sql** - 알림 시스템 스키마 (필수!)
- **supabase-update.sql** - 기존 DB 업데이트 (v1.x → v2.0)
- **supabase-maintenance-update.sql** - 유지보수 스케줄 테이블 추가
- **supabase-storage-policies.sql** - Storage 정책 설정 (필수!)
- **supabase-storage-policies-cleanup.sql** - Storage 정책 정리용

## 📄 라이선스

MIT License

---

**Made with ❤️ by lenisark**
