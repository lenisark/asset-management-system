import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Asset, Transaction, AssetStatus } from './types';

// 한글 폰트 로드를 위한 설정
// jsPDF는 기본적으로 한글을 지원하지 않으므로, 한글이 깨질 수 있습니다.
// 실제 배포 시에는 한글 폰트를 추가해야 합니다.

// 상태를 한글로 변환
const getStatusKorean = (status: AssetStatus): string => {
  const statusMap: Record<AssetStatus, string> = {
    'available': '사용가능',
    'in-use': '사용중',
    'maintenance': '점검중',
    'disposed': '폐기'
  };
  return statusMap[status] || status;
};

// 날짜 포맷팅
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};

// 금액 포맷팅
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
};

/**
 * 자산 목록 PDF 다운로드
 */
export const generateAssetListPDF = (assets: Asset[]) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape', // 가로 방향
      unit: 'mm',
      format: 'a4'
    });

    // 제목
    doc.setFontSize(18);
    doc.text('Asset List Report', 14, 15);
    
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString('ko-KR')}`, 14, 22);
    doc.text(`Total Assets: ${assets.length}`, 14, 28);

    // 테이블 데이터 준비
    const tableData = assets.map((asset, index) => [
      (index + 1).toString(),
      asset.name,
      asset.category,
      asset.serialNumber,
      asset.manufacturer,
      formatDate(asset.purchaseDate),
      formatCurrency(asset.purchasePrice),
      getStatusKorean(asset.status),
      asset.location,
    ]);

    // 테이블 생성
    autoTable(doc, {
      head: [['No', 'Name', 'Category', 'Serial No', 'Manufacturer', 'Purchase Date', 'Price', 'Status', 'Location']],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246], // blue-500
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [243, 244, 246], // gray-100
      },
      margin: { left: 14, right: 14 },
    });

    // PDF 다운로드
    const fileName = `Asset_List_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('PDF 생성 실패:', error);
    return false;
  }
};

/**
 * 거래 내역 PDF 다운로드
 */
export const generateTransactionPDF = (
  transactions: (Transaction & { assetName?: string })[]
) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // 제목
    doc.setFontSize(18);
    doc.text('Transaction History Report', 14, 15);
    
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString('ko-KR')}`, 14, 22);
    doc.text(`Total Transactions: ${transactions.length}`, 14, 28);

    // 테이블 데이터 준비
    const tableData = transactions.map((t, index) => [
      (index + 1).toString(),
      t.assetName || 'N/A',
      t.type === 'checkout' ? 'Check Out' : 'Check In',
      t.employeeName,
      t.department,
      formatDate(t.date),
      t.notes || '-',
      formatDate(t.createdAt),
    ]);

    // 테이블 생성
    autoTable(doc, {
      head: [['No', 'Asset', 'Type', 'Employee', 'Department', 'Date', 'Notes', 'Registered']],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [16, 185, 129], // green-500
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [243, 244, 246],
      },
      margin: { left: 14, right: 14 },
    });

    // PDF 다운로드
    const fileName = `Transaction_History_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('PDF 생성 실패:', error);
    return false;
  }
};

/**
 * 감가상각 보고서 PDF 다운로드
 */
export const generateDepreciationPDF = (assets: Asset[]) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // 제목
    doc.setFontSize(18);
    doc.text('Depreciation Report', 14, 15);
    
    doc.setFontSize(11);
    const currentDate = new Date();
    doc.text(`Generated: ${currentDate.toLocaleString('ko-KR')}`, 14, 22);
    doc.text(`Report Period: ${currentDate.getFullYear()}`, 14, 28);

    // 감가상각 계산 (정액법 - 5년 내용연수 가정)
    const depreciationData = assets.map((asset, index) => {
      const purchaseDate = new Date(asset.purchaseDate);
      const currentDate = new Date();
      const yearsElapsed = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      const usefulLife = 5; // 5년 내용연수
      const salvageValue = asset.purchasePrice * 0.1; // 잔존가치 10%
      const depreciableAmount = asset.purchasePrice - salvageValue;
      const annualDepreciation = depreciableAmount / usefulLife;
      const accumulatedDepreciation = Math.min(annualDepreciation * yearsElapsed, depreciableAmount);
      const bookValue = asset.purchasePrice - accumulatedDepreciation;

      return [
        (index + 1).toString(),
        asset.name,
        asset.category,
        formatDate(asset.purchaseDate),
        formatCurrency(asset.purchasePrice),
        formatCurrency(annualDepreciation),
        formatCurrency(accumulatedDepreciation),
        formatCurrency(Math.max(bookValue, salvageValue)),
        `${Math.min(yearsElapsed, usefulLife).toFixed(1)}/${usefulLife}`,
      ];
    });

    // 테이블 생성
    autoTable(doc, {
      head: [['No', 'Asset', 'Category', 'Purchase Date', 'Original Cost', 'Annual Depr.', 'Accumulated Depr.', 'Book Value', 'Age']],
      body: depreciationData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [139, 92, 246], // purple-500
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [243, 244, 246],
      },
      margin: { left: 14, right: 14 },
    });

    // 요약 정보
    const finalY = (doc as any).lastAutoTable.finalY || 35;
    const totalOriginalCost = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
    const totalBookValue = depreciationData.reduce((sum, row) => {
      const bookValueStr = row[7].replace(/[^\d]/g, '');
      return sum + parseInt(bookValueStr);
    }, 0);

    doc.setFontSize(10);
    doc.text(`Total Original Cost: ${formatCurrency(totalOriginalCost)}`, 14, finalY + 10);
    doc.text(`Total Book Value: ${formatCurrency(totalBookValue)}`, 14, finalY + 16);
    doc.text(`Total Depreciation: ${formatCurrency(totalOriginalCost - totalBookValue)}`, 14, finalY + 22);

    // PDF 다운로드
    const fileName = `Depreciation_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('PDF 생성 실패:', error);
    return false;
  }
};

/**
 * 카테고리별 자산 보고서 PDF
 */
export const generateCategoryReportPDF = (assets: Asset[]) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 제목
    doc.setFontSize(18);
    doc.text('Asset Category Report', 14, 15);
    
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString('ko-KR')}`, 14, 22);

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

    // 테이블 데이터
    const tableData = Object.entries(categoryStats).map(([category, stats]) => [
      category,
      stats.count.toString(),
      formatCurrency(stats.totalValue),
      formatCurrency(stats.totalValue / stats.count),
      stats.available.toString(),
      stats.inUse.toString(),
      stats.maintenance.toString(),
      stats.disposed.toString(),
    ]);

    // 테이블 생성
    autoTable(doc, {
      head: [['Category', 'Count', 'Total Value', 'Avg Value', 'Available', 'In Use', 'Maintenance', 'Disposed']],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [236, 72, 153], // pink-500
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    // PDF 다운로드
    const fileName = `Category_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('PDF 생성 실패:', error);
    return false;
  }
};
