# 회사 자산관리 시스템 (Supabase 버전)

PC, 모니터, 키보드, 마우스 등 회사 IT 자산을 효율적으로 관리할 수 있는 웹 애플리케이션입니다.
Supabase를 사용하여 실시간 데이터베이스 저장 및 동기화를 제공합니다.

## 주요 기능

### 1. 대시보드
- 전체 자산 현황 통계
- 상태별 자산 수량 (사용가능, 사용중, 점검중)
- 카테고리별 자산 분포
- 최근 등록 자산 목록

### 2. 자산 관리
- **자산 등록**: 새로운 자산 정보 입력
  - 자산명, 카테고리, 시리얼 번호
  - 제조사, 구매일, 구매금액
  - 상태, 위치, 비고
- **자산 수정**: 기존 자산 정보 변경
- **자산 삭제**: 불필요한 자산 제거
- **자산 검색**: 이름, 시리얼 번호, 제조사로 검색
- **필터링**: 카테고리 및 상태별 필터링

### 3. 불출/입고 관리
- **불출 등록**: 직원에게 자산 불출
  - 담당자명, 부서, 날짜 기록
  - 자동으로 자산 상태를 '사용중'으로 변경
- **입고 등록**: 자산 반납 처리
  - 반납 정보 기록
  - 자동으로 자산 상태를 '사용가능'으로 변경
- **이력 추적**: 각 자산별 불출/입고 이력 조회

### 4. 자산 상세 정보
- 전체 자산 정보 확인
- 불출/입고 이력 타임라인
- 이력에서 바로 불출/입고 등록 가능

## 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입/로그인
2. 새 프로젝트 생성
3. 프로젝트 설정에서 다음 정보 확인:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. 데이터베이스 스키마 생성

Supabase 대시보드에서 SQL Editor를 열고 `supabase-schema.sql` 파일의 내용을 실행하세요.

또는 다음 명령어를 순서대로 실행:

1. SQL Editor 열기
2. `supabase-schema.sql` 내용 복사
3. "Run" 버튼 클릭

이 스크립트는 다음을 생성합니다:
- `assets` 테이블 (자산 정보)
- `transactions` 테이블 (불출/입고 이력)
- 필요한 인덱스
- Row Level Security (RLS) 정책
- 자동 업데이트 트리거

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**참고**: `.env.example` 파일을 복사하여 시작할 수 있습니다.

```bash
cp .env.example .env
# .env 파일을 편집하여 실제 값을 입력하세요
```

## 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn
- Supabase 계정 및 프로젝트

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 프로덕션 빌드
```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 빌드 결과 미리보기
```bash
npm run preview
```

## 데이터베이스 구조

### Assets 테이블
```sql
- id (UUID): 고유 식별자
- name (TEXT): 자산명
- category (TEXT): 카테고리 (PC, Monitor, Keyboard, Mouse, Other)
- serial_number (TEXT): 시리얼 번호 (UNIQUE)
- manufacturer (TEXT): 제조사
- purchase_date (DATE): 구매일
- purchase_price (NUMERIC): 구매금액
- status (TEXT): 상태 (available, in-use, maintenance, disposed)
- location (TEXT): 위치
- notes (TEXT): 비고
- created_at (TIMESTAMPTZ): 생성일시
- updated_at (TIMESTAMPTZ): 수정일시
```

### Transactions 테이블
```sql
- id (UUID): 고유 식별자
- asset_id (UUID): 자산 ID (Foreign Key)
- type (TEXT): 거래 유형 (checkout, checkin)
- employee_name (TEXT): 담당자명
- department (TEXT): 부서
- date (DATE): 거래일
- notes (TEXT): 비고
- created_at (TIMESTAMPTZ): 생성일시
```

## 사용 방법

### 1. 자산 등록
1. 우측 상단 "자산 등록" 버튼 클릭
2. 필요한 정보 입력
3. "등록" 버튼 클릭

### 2. 자산 불출
1. 자산 목록에서 자산 선택 (눈 아이콘 클릭)
2. "불출/입고 등록" 버튼 클릭
3. "불출" 선택 후 담당자 정보 입력
4. "등록" 버튼 클릭

### 3. 자산 입고
1. 자산 상세 정보에서 "불출/입고 등록" 버튼 클릭
2. "입고" 선택 후 반납 정보 입력
3. "등록" 버튼 클릭

### 4. 자산 관리
- **수정**: 연필 아이콘 클릭
- **삭제**: 휴지통 아이콘 클릭 (확인 필요)
- **상세보기**: 눈 아이콘 클릭

## 자산 카테고리

- **PC**: 데스크톱, 노트북
- **Monitor**: 모니터, 디스플레이
- **Keyboard**: 키보드
- **Mouse**: 마우스
- **Other**: 기타 장비

## 자산 상태

- **사용 가능** (available): 배정 가능한 상태
- **사용 중** (in-use): 직원에게 불출된 상태
- **점검 중** (maintenance): 수리/점검 중인 상태
- **폐기** (disposed): 폐기 처리된 상태

## 보안 설정

### Row Level Security (RLS)

현재는 모든 사용자가 읽기/쓰기 권한을 가지고 있습니다.
실제 운영 환경에서는 다음과 같이 RLS 정책을 수정하세요:

```sql
-- 예: 인증된 사용자만 접근 가능
DROP POLICY IF EXISTS "Enable read access for all users" ON assets;
CREATE POLICY "Enable read access for authenticated users" ON assets
  FOR SELECT USING (auth.role() = 'authenticated');
```

### 환경 변수 보안

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요
- Anon Key는 클라이언트 사이드에서 사용 가능하지만, RLS로 보호하세요

## 트러블슈팅

### Supabase 연결 오류

1. `.env` 파일의 URL과 Key가 올바른지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 브라우저 콘솔에서 오류 메시지 확인

### 데이터가 표시되지 않음

1. SQL 스키마가 올바르게 생성되었는지 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. 네트워크 탭에서 API 호출 확인

## 향후 개선 사항

- [x] Supabase 연동
- [ ] 실시간 업데이트 (Supabase Realtime)
- [ ] 사용자 인증 및 권한 관리
- [ ] Excel 내보내기/가져오기
- [ ] 자산 QR 코드 생성
- [ ] 자산 사진 업로드 (Supabase Storage)
- [ ] 자산 유지보수 일정 관리
- [ ] 자산 감가상각 계산
- [ ] 알림 기능 (점검 예정일 등)
- [ ] 대시보드 차트 추가
- [ ] 모바일 앱 버전

## 파일 구조

```
webapp/
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── Dashboard.tsx
│   │   ├── AssetList.tsx
│   │   ├── AssetForm.tsx
│   │   ├── AssetDetail.tsx
│   │   └── TransactionForm.tsx
│   ├── types.ts           # TypeScript 타입 정의
│   ├── utils-supabase.ts  # Supabase 유틸리티 함수
│   ├── supabaseClient.ts  # Supabase 클라이언트 설정
│   ├── App.tsx            # 메인 앱 컴포넌트
│   └── main.tsx           # 앱 엔트리 포인트
├── supabase-schema.sql    # 데이터베이스 스키마
├── .env.example           # 환경 변수 예제
└── README.md              # 프로젝트 문서
```

## 라이선스

MIT License

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
