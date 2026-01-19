import type { Depreciation } from './types';

/**
 * 감가상각 계산 유틸리티
 * 
 * 정액법 (Straight-Line Method): 매년 동일한 금액 감가상각
 * 정률법 (Declining Balance Method): 잔존가치에 비율을 곱하여 감가상각
 */

/**
 * 정액법 감가상각 계산
 * 
 * 공식: (취득원가 - 잔존가치) / 내용연수
 * 
 * @param purchasePrice 취득원가
 * @param salvageValue 잔존가치
 * @param usefulLife 내용연수 (년)
 * @returns 연도별 감가상각비 배열
 */
export const calculateStraightLineDepreciation = (
  purchasePrice: number,
  salvageValue: number,
  usefulLife: number
): number[] => {
  const depreciationPerYear = (purchasePrice - salvageValue) / usefulLife;
  return Array(usefulLife).fill(depreciationPerYear);
};

/**
 * 정률법 감가상각 계산
 * 
 * 공식: 전기말 장부가액 × 상각률
 * 상각률 = 1 - (잔존가치 / 취득원가) ^ (1 / 내용연수)
 * 
 * @param purchasePrice 취득원가
 * @param salvageValue 잔존가치
 * @param usefulLife 내용연수 (년)
 * @returns 연도별 감가상각비 배열
 */
export const calculateDecliningBalanceDepreciation = (
  purchasePrice: number,
  salvageValue: number,
  usefulLife: number
): number[] => {
  // 상각률 계산
  const depreciationRate = 1 - Math.pow(salvageValue / purchasePrice, 1 / usefulLife);
  
  const yearlyDepreciation: number[] = [];
  let bookValue = purchasePrice;
  
  for (let year = 0; year < usefulLife; year++) {
    const depreciation = bookValue * depreciationRate;
    yearlyDepreciation.push(depreciation);
    bookValue -= depreciation;
  }
  
  return yearlyDepreciation;
};

/**
 * 감가상각 정보 계산
 * 
 * @param purchasePrice 취득원가
 * @param purchaseDate 구매일 (YYYY-MM-DD)
 * @param salvageValue 잔존가치
 * @param usefulLife 내용연수 (년)
 * @param method 감가상각 방법 ('straight-line' | 'declining-balance')
 * @returns Depreciation 객체
 */
export const calculateDepreciation = (
  assetId: string,
  assetName: string,
  purchasePrice: number,
  purchaseDate: string,
  salvageValue: number,
  usefulLife: number,
  method: 'straight-line' | 'declining-balance' = 'straight-line'
): Depreciation => {
  // 연도별 감가상각비 계산
  const yearlyDepreciation =
    method === 'straight-line'
      ? calculateStraightLineDepreciation(purchasePrice, salvageValue, usefulLife)
      : calculateDecliningBalanceDepreciation(purchasePrice, salvageValue, usefulLife);

  // 구매일로부터 경과 연수 계산
  const purchaseDateObj = new Date(purchaseDate);
  const currentDate = new Date();
  const yearsPassed = Math.floor(
    (currentDate.getTime() - purchaseDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  // 경과 연수만큼 감가상각비 누적
  const accumulatedDepreciation = yearlyDepreciation
    .slice(0, Math.min(yearsPassed, usefulLife))
    .reduce((sum, value) => sum + value, 0);

  // 현재 장부가액 계산
  const currentValue = Math.max(purchasePrice - accumulatedDepreciation, salvageValue);

  return {
    assetId,
    assetName,
    purchasePrice,
    purchaseDate,
    usefulLife,
    salvageValue,
    method,
    currentValue,
    accumulatedDepreciation,
    yearlyDepreciation,
  };
};

/**
 * 감가상각 스케줄 생성 (회계 리포트용)
 * 
 * @param depreciation Depreciation 객체
 * @returns 연도별 상세 감가상각 정보
 */
export interface DepreciationSchedule {
  year: number;
  beginningBookValue: number;
  depreciation: number;
  accumulatedDepreciation: number;
  endingBookValue: number;
}

export const generateDepreciationSchedule = (
  depreciation: Depreciation
): DepreciationSchedule[] => {
  const schedule: DepreciationSchedule[] = [];
  let bookValue = depreciation.purchasePrice;
  let accumulated = 0;

  for (let year = 0; year < depreciation.usefulLife; year++) {
    const depreciationAmount = depreciation.yearlyDepreciation[year];
    accumulated += depreciationAmount;
    const endingValue = Math.max(bookValue - depreciationAmount, depreciation.salvageValue);

    schedule.push({
      year: year + 1,
      beginningBookValue: bookValue,
      depreciation: depreciationAmount,
      accumulatedDepreciation: accumulated,
      endingBookValue: endingValue,
    });

    bookValue = endingValue;
  }

  return schedule;
};

/**
 * 감가상각율 계산
 * 
 * @param usefulLife 내용연수 (년)
 * @returns 감가상각율 (%)
 */
export const calculateDepreciationRate = (usefulLife: number): number => {
  return (1 / usefulLife) * 100;
};

/**
 * 잔존가치율 계산 (일반적으로 취득원가의 10%)
 * 
 * @param purchasePrice 취득원가
 * @returns 잔존가치
 */
export const estimateSalvageValue = (purchasePrice: number): number => {
  return purchasePrice * 0.1;
};

/**
 * 자산 카테고리별 권장 내용연수
 */
export const RECOMMENDED_USEFUL_LIFE: Record<string, number> = {
  PC: 5,
  Monitor: 5,
  Keyboard: 3,
  Mouse: 3,
  Other: 5,
};

/**
 * 권장 내용연수 조회
 * 
 * @param category 자산 카테고리
 * @returns 권장 내용연수 (년)
 */
export const getRecommendedUsefulLife = (category: string): number => {
  return RECOMMENDED_USEFUL_LIFE[category] || 5;
};

/**
 * 감가상각비 총액 계산
 * 
 * @param yearlyDepreciation 연도별 감가상각비 배열
 * @returns 총 감가상각비
 */
export const getTotalDepreciation = (yearlyDepreciation: number[]): number => {
  return yearlyDepreciation.reduce((sum, value) => sum + value, 0);
};

/**
 * 평균 연간 감가상각비 계산
 * 
 * @param yearlyDepreciation 연도별 감가상각비 배열
 * @returns 평균 연간 감가상각비
 */
export const getAverageYearlyDepreciation = (yearlyDepreciation: number[]): number => {
  return getTotalDepreciation(yearlyDepreciation) / yearlyDepreciation.length;
};
