import * as XLSX from 'xlsx';
import { Asset, Transaction, AssetCategory, AssetStatus } from './types';
import { saveAsset, getAssets } from './utils-supabase';

// 자산 목록을 Excel 파일로 내보내기
export const exportAssetsToExcel = (assets: Asset[]) => {
  try {
    // 데이터를 Excel 형식에 맞게 변환
    const data = assets.map((asset) => ({
      '자산명': asset.name,
      '카테고리': asset.category,
      '시리얼번호': asset.serialNumber,
      '제조사': asset.manufacturer,
      '구매일자': asset.purchaseDate,
      '구매가격': asset.purchasePrice,
      '상태': asset.status,
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
        '상태': 'available',
        '위치': '본사 3층 개발팀',
        '비고': '개발용 PC',
      },
      {
        '자산명': 'LG 27인치 모니터',
        '카테고리': 'Monitor',
        '시리얼번호': 'SN-MON-001',
        '제조사': 'LG',
        '구매일자': '2024-01-20',
        '구매가격': 350000,
        '상태': 'available',
        '위치': '본사 3층 개발팀',
        '비고': '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    const columnWidths = [
      { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 30 },
    ];
    worksheet['!cols'] = columnWidths;

    // 헤더에 설명 추가
    const instructions = [
      ['자산 등록 템플릿 - 아래 예시를 참고하여 작성해주세요'],
      ['카테고리: PC, Monitor, Keyboard, Mouse, Other'],
      ['상태: available(사용가능), in-use(사용중), maintenance(점검중), disposed(폐기)'],
      [''],
    ];

    const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.sheet_add_json(instructionSheet, templateData, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, instructionSheet, '자산등록템플릿');

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

            // 카테고리 유효성 검사
            const validCategories: AssetCategory[] = ['PC', 'Monitor', 'Keyboard', 'Mouse', 'Other'];
            if (!validCategories.includes(row['카테고리'])) {
              errors.push(`${rowNum}행: 카테고리는 PC, Monitor, Keyboard, Mouse, Other 중 하나여야 합니다.`);
              continue;
            }

            // 상태 유효성 검사
            const validStatuses: AssetStatus[] = ['available', 'in-use', 'maintenance', 'disposed'];
            if (row['상태'] && !validStatuses.includes(row['상태'])) {
              errors.push(`${rowNum}행: 상태는 available, in-use, maintenance, disposed 중 하나여야 합니다.`);
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
              category: row['카테고리'],
              serialNumber: row['시리얼번호'],
              manufacturer: row['제조사'],
              purchaseDate: typeof row['구매일자'] === 'string' 
                ? row['구매일자'] 
                : new Date(row['구매일자']).toISOString().split('T')[0],
              purchasePrice: Number(row['구매가격']),
              status: row['상태'] || 'available',
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
