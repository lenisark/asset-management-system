import type { Asset, MaintenanceSchedule } from './types';

/**
 * 월별 구매 금액 데이터 생성
 */
export const getMonthlyPurchaseData = (assets: Asset[]) => {
  const monthlyData: Record<string, number> = {};
  
  assets.forEach(asset => {
    if (asset.purchaseDate) {
      const date = new Date(asset.purchaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (asset.purchasePrice || 0);
    }
  });

  // 최근 12개월 데이터만 반환
  const sortedKeys = Object.keys(monthlyData).sort().slice(-12);
  return sortedKeys.map(key => ({
    month: key,
    amount: monthlyData[key]
  }));
};

/**
 * 자산 가치 추이 데이터 생성 (감가상각 고려)
 */
export const getAssetValueTrendData = (assets: Asset[]) => {
  const currentDate = new Date();
  const months: string[] = [];
  
  // 최근 12개월 생성
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  return months.map(month => {
    const [year, monthNum] = month.split('-').map(Number);
    const targetDate = new Date(year, monthNum - 1, 1);
    
    // 해당 월까지 구매된 자산의 가치 계산 (감가상각 고려)
    let totalValue = 0;
    
    assets.forEach(asset => {
      const purchaseDate = new Date(asset.purchaseDate);
      
      // 해당 월 이전에 구매된 자산만 포함
      if (purchaseDate <= targetDate && asset.status !== 'disposed') {
        const monthsElapsed = (targetDate.getFullYear() - purchaseDate.getFullYear()) * 12 
                            + (targetDate.getMonth() - purchaseDate.getMonth());
        
        // 간단한 정액법 감가상각 (5년 = 60개월)
        const usefulLifeMonths = 60;
        const monthlyDepreciation = (asset.purchasePrice || 0) / usefulLifeMonths;
        const currentValue = Math.max(0, (asset.purchasePrice || 0) - (monthlyDepreciation * monthsElapsed));
        
        totalValue += currentValue;
      }
    });

    return {
      month,
      value: Math.round(totalValue)
    };
  });
};

/**
 * 유지보수 비용 추이 데이터 생성
 */
export const getMaintenanceCostTrendData = (maintenanceSchedules: MaintenanceSchedule[]) => {
  const monthlyData: Record<string, number> = {};
  
  maintenanceSchedules.forEach(schedule => {
    if (schedule.scheduledDate && schedule.cost) {
      const date = new Date(schedule.scheduledDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + schedule.cost;
    }
  });

  // 최근 12개월 데이터만 반환
  const sortedKeys = Object.keys(monthlyData).sort().slice(-12);
  return sortedKeys.map(key => ({
    month: key,
    cost: monthlyData[key]
  }));
};

/**
 * 월 표시 형식 변환 (2024-01 → 1월)
 */
export const formatMonthLabel = (monthKey: string) => {
  const [, month] = monthKey.split('-');
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
