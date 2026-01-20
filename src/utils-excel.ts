import * as XLSX from 'xlsx';
import type { Asset, Transaction, AssetCategory, AssetStatus } from './types';
import { saveAsset, getAssets } from './utils-supabase';

// 한글 카테고리 → 영어 카테고리 변환
const categoryKoreanToEnglish: Record<string, AssetCategory> = {
  'PC': 'PC',
  '데스크톱': 'PC',
  '노트북': 'Laptop',
  'Laptop': 'Laptop',
  '모니터': 'Monitor',
  'Monitor': 'Monitor',
  '키보드': 'Keyboard',
  'Keyboard': 'Keyboard',
  '마우스': 'Mouse',
  'Mouse': 'Mouse',
  '프린터': 'Printer',
  'Printer': 'Printer',
  '태블릿': 'Tablet',
  'Tablet': 'Tablet',
  '휴대폰': 'Phone',
  'Phone': 'Phone',
  '케이블': 'Cable',
  'Cable': 'Cable',
  '기타': 'Other',
  'Other': 'Other',
};

// 한글 상태 → 영어 상태 변환
const statusKoreanToEnglish: Record<string, AssetStatus> = {
  '사용가능': 'available',
  '사용 가능': 'available',
  'available': 'available',
  '사용중': 'in-use',
  '사용 중': 'in-use',
  'in-use': 'in-use',
  '점검중': 'maintenance',
  '점검 중': 'maintenance',
  'maintenance': 'maintenance',
  '폐기': 'disposed',
  'disposed': 'disposed',
};

// 자산 목록을 Excel 파일로 내보내기
export const exportAssetsToExcel = (assets: Asset[]) => {
  try {
    // 상태 한글 변환 함수
    const getStatusKorean = (status: AssetStatus): string => {
      const statusMap: Record<AssetStatus, string> = {
        'available': '사용가능',
        'in-use': '사용중',
        'maintenance': '점검중',
        'disposed': '폐기'
      };
      return statusMap[status] || status;
    };

    // 데이터를 Excel 형식에 맞게 변환
    const data = assets.map((asset) => ({
      '자산명': asset.name,
      '카테고리': asset.category,
      '시리얼번호': asset.serialNumber,
      '제조사': asset.manufacturer,
      '구매일자': asset.purchaseDate,
      '구매가격': asset.purchasePrice,
      '상태': getStatusKorean(asset.status), // 한글로 변환
      '위치': asset.location,
      '비고': asset.notes || '',
      '등록일': new Date(asset.createdAt).toLocaleDateString('ko-KR'),
    }));

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 컬럼 너비 자동 조정
    const columnWidths = [
      { wch: 20 }, // 자산명
      { wch: 15 }, // 카테고리
      { wch: 20 }, // 시리얼번호
      { wch: 15 }, // 제조사
      { wch: 15 }, // 구매일자
      { wch: 15 }, // 구매가격
      { wch: 12 }, // 상태
      { wch: 20 }, // 위치
      { wch: 30 }, // 비고
      { wch: 15 }, // 등록일
    ];
    worksheet['!cols'] = columnWidths;

    // 워크북 생성 및 워크시트 추가
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '자산목록');

    // 파일 다운로드
    const fileName = `자산목록_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return true;
  } catch (error) {
    console.error('Excel 내보내기 실패:', error);
    return false;
  }
};

// 거래 내역을 Excel 파일로 내보내기
export const exportTransactionsToExcel = (transactions: (Transaction & { assetName?: string })[]) => {
  try {
    const data = transactions.map((t) => ({
      '자산명': t.assetName || '',
      '거래유형': t.type === 'checkout' ? '불출' : '입고',
      '담당자': t.employeeName,
      '부서': t.department,
      '날짜': t.date,
      '비고': t.notes || '',
      '등록일': new Date(t.createdAt).toLocaleDateString('ko-KR'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = [
      { wch: 20 }, // 자산명
      { wch: 12 }, // 거래유형
      { wch: 15 }, // 담당자
      { wch: 20 }, // 부서
      { wch: 15 }, // 날짜
      { wch: 30 }, // 비고
      { wch: 15 }, // 등록일
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '거래내역');

    const fileName = `거래내역_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return true;
  } catch (error) {
    console.error('Excel 내보내기 실패:', error);
    return false;
  }
};

// Excel 템플릿 다운로드 (자산 등록용)
export const downloadAssetTemplate = () => {
  try {
    const templateData = [
      {
        '자산명': 'Dell OptiPlex 7090',
        '카테고리': 'PC',
        '시리얼번호': 'SN-PC-001',
        '제조사': 'Dell',
        '구매일자': '2024-01-15',
        '구매가격': 1500000,
        '상태': '사용가능',
        '위치': '본사 3층 개발팀',
        '비고': '개발용 PC',
      },
      {
        '자산명': 'LG 27인치 모니터',
        '카테고리': '모니터',
        '시리얼번호': 'SN-MON-001',
        '제조사': 'LG',
        '구매일자': '2024-01-20',
        '구매가격': 350000,
        '상태': '사용가능',
        '위치': '본사 3층 개발팀',
        '비고': '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    const columnWidths = [
      { wch: 20 }, // 자산명
      { wch: 15 }, // 카테고리
      { wch: 20 }, // 시리얼번호
      { wch: 15 }, // 제조사
      { wch: 15 }, // 구매일자
      { wch: 15 }, // 구매가격
      { wch: 12 }, // 상태
      { wch: 20 }, // 위치
      { wch: 30 }, // 비고
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '자산등록템플릿');

    XLSX.writeFile(workbook, '자산등록템플릿.xlsx');

    return true;
  } catch (error) {
    console.error('템플릿 다운로드 실패:', error);
    return false;
  }
};

// Excel 파일에서 자산 가져오기
export const importAssetsFromExcel = async (file: File): Promise<{
  success: boolean;
  imported: number;
  errors: string[];
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const errors: string[] = [];
        let imported = 0;

        // 기존 자산 목록 조회 (중복 체크용)
        const existingAssets = await getAssets();
        const existingSerialNumbers = new Set(existingAssets.map(a => a.serialNumber));

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowNum = i + 2; // Excel 행 번호 (헤더 제외)

          try {
            // 필수 필드 검증
            if (!row['자산명']) {
              errors.push(`${rowNum}행: 자산명은 필수입니다.`);
              continue;
            }
            if (!row['카테고리']) {
              errors.push(`${rowNum}행: 카테고리는 필수입니다.`);
              continue;
            }
            if (!row['시리얼번호']) {
              errors.push(`${rowNum}행: 시리얼번호는 필수입니다.`);
              continue;
            }
            if (!row['제조사']) {
              errors.push(`${rowNum}행: 제조사는 필수입니다.`);
              continue;
            }
            if (!row['구매일자']) {
              errors.push(`${rowNum}행: 구매일자는 필수입니다.`);
              continue;
            }
            if (!row['구매가격']) {
              errors.push(`${rowNum}행: 구매가격은 필수입니다.`);
              continue;
            }
            if (!row['위치']) {
              errors.push(`${rowNum}행: 위치는 필수입니다.`);
              continue;
            }

            // 카테고리 변환 (한글 → 영어)
            const inputCategory = row['카테고리']?.trim();
            const category = categoryKoreanToEnglish[inputCategory];
            
            if (!category) {
              errors.push(`${rowNum}행: 카테고리가 올바르지 않습니다. (입력값: ${inputCategory})`);
              errors.push(`  허용: PC/데스크톱, Laptop/노트북, Monitor/모니터, Keyboard/키보드, Mouse/마우스, Printer/프린터, Tablet/태블릿, Phone/휴대폰, Cable/케이블, Other/기타`);
              continue;
            }

            // 상태 변환 (한글 → 영어)
            const inputStatus = row['상태']?.trim() || '사용가능';
            const status = statusKoreanToEnglish[inputStatus];
            
            if (!status) {
              errors.push(`${rowNum}행: 상태가 올바르지 않습니다. (입력값: ${inputStatus})`);
              errors.push(`  허용: available/사용가능, in-use/사용중, maintenance/점검중, disposed/폐기`);
              continue;
            }

            // 시리얼번호 중복 검사
            if (existingSerialNumbers.has(row['시리얼번호'])) {
              errors.push(`${rowNum}행: 시리얼번호 '${row['시리얼번호']}'는 이미 존재합니다.`);
              continue;
            }

            // 자산 객체 생성
            const newAsset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'> = {
              name: row['자산명'],
              category: category, // 변환된 영어 카테고리
              serialNumber: row['시리얼번호'],
              manufacturer: row['제조사'],
              purchaseDate: typeof row['구매일자'] === 'string' 
                ? row['구매일자'] 
                : new Date(row['구매일자']).toISOString().split('T')[0],
              purchasePrice: Number(row['구매가격']),
              status: status, // 변환된 영어 상태
              location: row['위치'],
              notes: row['비고'] || '',
            };

            // Supabase에 저장
            const success = await saveAsset(newAsset as Asset);
            if (success) {
              imported++;
              existingSerialNumbers.add(row['시리얼번호']); // 중복 방지
            } else {
              errors.push(`${rowNum}행: 저장 실패`);
            }
          } catch (error) {
            errors.push(`${rowNum}행: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
          }
        }

        resolve({
          success: imported > 0,
          imported,
          errors,
        });
      } catch (error) {
        console.error('Excel 가져오기 실패:', error);
        resolve({
          success: false,
          imported: 0,
          errors: ['파일 읽기 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류')],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        imported: 0,
        errors: ['파일 읽기 실패'],
      });
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * 감가상각 보고서 Excel 다운로드
 */
export const exportDepreciationReport = (assets: Asset[]) => {
  try {
    // 감가상각 계산 (정액법 - 5년 내용연수)
    const reportData = assets.map((asset, index) => {
      const purchaseDate = new Date(asset.purchaseDate);
      const currentDate = new Date();
      const yearsElapsed = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      const usefulLife = 5; // 5년 내용연수
      const salvageValue = asset.purchasePrice * 0.1; // 잔존가치 10%
      const depreciableAmount = asset.purchasePrice - salvageValue;
      const annualDepreciation = depreciableAmount / usefulLife;
      const accumulatedDepreciation = Math.min(annualDepreciation * yearsElapsed, depreciableAmount);
      const bookValue = asset.purchasePrice - accumulatedDepreciation;

      return {
        '번호': index + 1,
        '자산명': asset.name,
        '카테고리': asset.category,
        '구매일자': asset.purchaseDate,
        '원가': asset.purchasePrice,
        '연간감가상각비': Math.round(annualDepreciation),
        '누적감가상각액': Math.round(accumulatedDepreciation),
        '장부가액': Math.round(Math.max(bookValue, salvageValue)),
        '사용연수': `${Math.min(yearsElapsed, usefulLife).toFixed(1)}/${usefulLife}년`,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(reportData);

    const columnWidths = [
      { wch: 8 },  // 번호
      { wch: 25 }, // 자산명
      { wch: 15 }, // 카테고리
      { wch: 15 }, // 구매일자
      { wch: 15 }, // 원가
      { wch: 15 }, // 연간감가상각비
      { wch: 15 }, // 누적감가상각액
      { wch: 15 }, // 장부가액
      { wch: 15 }, // 사용연수
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '감가상각보고서');

    const fileName = `감가상각보고서_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return true;
  } catch (error) {
    console.error('감가상각 보고서 생성 실패:', error);
    return false;
  }
};

/**
 * 카테고리별 통계 보고서 Excel 다운로드
 */
export const exportCategoryReport = (assets: Asset[]) => {
  try {
    // 카테고리별 집계
    const categoryStats = assets.reduce((acc, asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = {
          count: 0,
          totalValue: 0,
          available: 0,
          inUse: 0,
          maintenance: 0,
          disposed: 0,
        };
      }
      acc[asset.category].count++;
      acc[asset.category].totalValue += asset.purchasePrice;
      
      if (asset.status === 'available') acc[asset.category].available++;
      else if (asset.status === 'in-use') acc[asset.category].inUse++;
      else if (asset.status === 'maintenance') acc[asset.category].maintenance++;
      else if (asset.status === 'disposed') acc[asset.category].disposed++;
      
      return acc;
    }, {} as Record<string, any>);

    const reportData = Object.entries(categoryStats).map(([category, stats]) => ({
      '카테고리': category,
      '자산수': stats.count,
      '총가치': stats.totalValue,
      '평균가치': Math.round(stats.totalValue / stats.count),
      '사용가능': stats.available,
      '사용중': stats.inUse,
      '점검중': stats.maintenance,
      '폐기': stats.disposed,
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);

    const columnWidths = [
      { wch: 15 }, // 카테고리
      { wch: 10 }, // 자산수
      { wch: 15 }, // 총가치
      { wch: 15 }, // 평균가치
      { wch: 10 }, // 사용가능
      { wch: 10 }, // 사용중
      { wch: 10 }, // 점검중
      { wch: 10 }, // 폐기
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '카테고리별통계');

    const fileName = `카테고리별통계_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return true;
  } catch (error) {
    console.error('카테고리별 통계 보고서 생성 실패:', error);
    return false;
  }
};
