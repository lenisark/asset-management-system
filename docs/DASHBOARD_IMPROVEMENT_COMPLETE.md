# 대시보드 개선 완료 보고서

**작업 일자**: 2026-01-19  
**작업 순서**: 4번 (1. 알림 시스템 ✅ → 3. 검색 개선 ✅ → **4. 대시보드 개선 ✅**)

---

## 🎯 작업 목표

대시보드에 **recharts 기반의 고급 그래프**를 추가하여 자산 데이터를 시각적으로 분석할 수 있도록 개선

---

## ✅ 완료된 작업 (4/4)

| 번호 | 작업 | 상태 | 소요 시간 |
|------|------|------|-----------|
| 1 | recharts 라이브러리 설치 | ✅ | 5분 |
| 2 | 자산 가치 추이 그래프 (Line Chart) | ✅ | 1시간 |
| 3 | 월별 구매 금액 그래프 (Bar Chart) | ✅ | 30분 |
| 4 | 다크 모드 지원 | ✅ | 30분 |

**총 소요 시간**: 약 2시간

---

## 📦 설치된 패키지

```bash
npm install recharts
```

- **recharts**: 42개 패키지 추가
- **버전**: 최신 버전 (2.x)

---

## 📝 구현 내용

### 1. **utils-dashboard.ts 유틸리티 함수 생성**

새로운 파일: `src/utils-dashboard.ts`

```typescript
/**
 * 월별 구매 금액 데이터 생성
 */
export const getMonthlyPurchaseData = (assets: Asset[]) => {
  // 최근 12개월 구매 금액 집계
  // 반환: { month: '2024-01', amount: 5000000 }[]
};

/**
 * 자산 가치 추이 데이터 생성 (감가상각 고려)
 */
export const getAssetValueTrendData = (assets: Asset[]) => {
  // 최근 12개월 자산 가치 계산 (5년 정액법 감가상각)
  // 반환: { month: '2024-01', value: 15000000 }[]
};

/**
 * 유지보수 비용 추이 데이터 생성
 */
export const getMaintenanceCostTrendData = (maintenanceSchedules: MaintenanceSchedule[]) => {
  // 최근 12개월 유지보수 비용 집계
  // 반환: { month: '2024-01', cost: 500000 }[]
};

/**
 * 월 표시 형식 변환 (2024-01 → 1월)
 */
export const formatMonthLabel = (monthKey: string) => {
  return `${parseInt(month)}월`;
};

/**
 * 통화 형식 변환
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
  }).format(value);
};
```

---

### 2. **Dashboard 컴포넌트에 recharts 그래프 추가**

#### A. **자산 가치 추이 그래프** (Line Chart)

```tsx
<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
    자산 가치 추이 (감가상각 반영)
  </h3>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={assetValueTrendData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis 
        dataKey="month" 
        tickFormatter={formatMonthLabel}
        stroke="#6b7280"
      />
      <YAxis 
        tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
        stroke="#6b7280"
      />
      <RechartsTooltip 
        formatter={(value) => [formatCurrency(Number(value)), '자산 가치']}
        labelFormatter={formatMonthLabel}
      />
      <Line 
        type="monotone" 
        dataKey="value" 
        stroke="#3b82f6" 
        strokeWidth={2}
        dot={{ fill: '#3b82f6', r: 4 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
```

**특징**:
- 📉 **5년 정액법 감가상각** 적용
- 🔵 파란색 라인 (#3b82f6)
- 💰 Y축: 만원 단위 표시
- 🗓️ X축: 월별 표시 (1월, 2월, ...)
- 🖱️ 호버: 정확한 원화 금액 표시

---

#### B. **월별 구매 금액 그래프** (Bar Chart)

```tsx
<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
    월별 구매 금액
  </h3>
  <ResponsiveContainer width="100%" height={300}>
    <RechartsBar data={monthlyPurchaseData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis 
        dataKey="month" 
        tickFormatter={formatMonthLabel}
        stroke="#6b7280"
      />
      <YAxis 
        tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
        stroke="#6b7280"
      />
      <RechartsTooltip 
        formatter={(value) => [formatCurrency(Number(value)), '구매 금액']}
        labelFormatter={formatMonthLabel}
      />
      <RechartsBarElement 
        dataKey="amount" 
        fill="#10b981" 
        radius={[8, 8, 0, 0]}
      />
    </RechartsBar>
  </ResponsiveContainer>
</div>
```

**특징**:
- 📊 **월별 구매 금액** 집계
- 🟢 초록색 바 (#10b981)
- 💰 Y축: 만원 단위 표시
- 🗓️ X축: 월별 표시
- 🔘 둥근 모서리 (radius: [8, 8, 0, 0])

---

### 3. **다크 모드 지원 추가**

모든 대시보드 요소에 다크 모드 적용:

```tsx
// 통계 카드
<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
  <p className="text-sm text-gray-600 dark:text-gray-300">전체 자산</p>
  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalAssets}</p>
</div>

// 차트 카드
<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
    자산 가치 추이 (감가상각 반영)
  </h3>
  {/* 그래프 */}
</div>

// 테이블
<thead>
  <tr className="bg-gray-50 dark:bg-gray-700">
    <th className="text-gray-500 dark:text-gray-300">자산명</th>
  </tr>
</thead>
<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
  <tr>
    <td className="text-gray-900 dark:text-gray-100">{asset.name}</td>
  </tr>
</tbody>

// 상태 배지
<span className={`px-2 py-1 text-xs rounded-full ${
  asset.status === 'available' 
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}`}>
  {asset.status === 'available' ? '사용가능' : '사용중'}
</span>
```

---

## 🎨 대시보드 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  대시보드                                                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                    │
│  │전체  │  │사용  │  │사용중│  │점검중│   ← 통계 카드        │
│  │자산  │  │가능  │  │     │  │     │                       │
│  └──────┘  └──────┘  └──────┘  └──────┘                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ 자산 상태 분포  │  │ 카테고리별 자산 │  ← Chart.js 차트  │
│  │  (Pie Chart)    │  │  (Bar Chart)    │                  │
│  └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ 자산 가치 추이  │  │ 월별 구매 금액  │  ← Recharts 그래프│
│  │  (Line Chart)   │  │  (Bar Chart)    │                  │
│  └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 카테고리별 자산                                      │    │
│  │  PC   Monitor  Keyboard  Mouse  Other               │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 최근 등록 자산 (테이블)                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 데이터 계산 로직

### 1. **자산 가치 추이 계산**

```typescript
// 정액법 감가상각 (5년 = 60개월)
const usefulLifeMonths = 60;
const monthlyDepreciation = purchasePrice / usefulLifeMonths;
const monthsElapsed = (targetDate - purchaseDate) / 월;
const currentValue = Math.max(0, purchasePrice - (monthlyDepreciation * monthsElapsed));
```

**예시**:
- 구매 가격: 3,000,000원
- 내용연수: 60개월 (5년)
- 월별 감가상각: 50,000원/월
- 12개월 후 가치: 2,400,000원
- 60개월 후 가치: 0원

---

### 2. **월별 구매 금액 집계**

```typescript
// 자산 구매일 기준으로 월별 합산
const monthKey = `${year}-${month.padStart(2, '0')}`; // '2024-01'
monthlyData[monthKey] += asset.purchasePrice;
```

**예시**:
- 2024-01: 5,000,000원 (PC 2대)
- 2024-02: 1,500,000원 (모니터 3대)
- 2024-03: 0원 (구매 없음)

---

## 🚀 GitHub 커밋

- **커밋 메시지**: `feat: Dashboard 개선 - recharts 그래프 추가 (자산 가치 추이, 월별 구매 금액) 및 다크 모드 지원`
- **변경 파일**:
  - `package.json` / `package-lock.json` (recharts 추가)
  - `src/components/Dashboard.tsx` (+614줄, -43줄)
  - `src/utils-dashboard.ts` (신규 파일, 108줄)
- **커밋 해시**: `2ec4133`
- **GitHub 링크**: https://github.com/lenisark/asset-management-system/commit/2ec4133

---

## 🎯 비즈니스 가치

### 1. **경영진 의사결정 지원**
- 📈 자산 가치 추이 → 감가상각 트렌드 파악
- 💰 월별 구매 금액 → 예산 계획 수립

### 2. **자산 관리 최적화**
- 🔍 시각적 데이터 분석 → 자산 교체 시기 예측
- 📊 구매 패턴 분석 → 예산 효율화

### 3. **사용자 경험 개선**
- 🌓 다크 모드 지원 → 야간 작업 편의성
- 📱 반응형 그래프 → 모든 디바이스 대응

---

## 🔜 다음 작업

**5. 보고서 생성** (3개 작업, 8-10시간)

1. ✅ jspdf 라이브러리 설치 ⏳
2. ✅ 자산 목록 PDF 다운로드 ⏳
3. ✅ 감가상각 회계 보고서 템플릿 ⏳

**예상 소요 시간**: 8-10시간

---

## 📚 참고 문서

- **Recharts 공식 문서**: https://recharts.org/
- **감가상각 계산 로직**: `src/utils-dashboard.ts`
- **Dashboard 컴포넌트**: `src/components/Dashboard.tsx`
- **Future Roadmap**: `docs/FUTURE_ROADMAP.md`

---

## 📌 완료 체크리스트

- [x] recharts 라이브러리 설치
- [x] 자산 가치 추이 그래프 구현 (Line Chart)
- [x] 월별 구매 금액 그래프 구현 (Bar Chart)
- [x] 유틸리티 함수 작성 (utils-dashboard.ts)
- [x] 다크 모드 지원 추가
- [x] TypeScript 타입 체크 통과
- [x] 빌드 테스트 성공
- [x] Git 커밋 및 푸시
- [x] 완료 문서 작성

---

**작업 완료일**: 2026-01-19  
**다음 작업**: 5. 보고서 생성 (jspdf 설치 → PDF 다운로드 구현)
