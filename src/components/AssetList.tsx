import { useState, useRef } from 'react';
import type { Asset, AssetCategory, AssetStatus } from '../types';
import { Search, Edit, Trash2, Eye, Download, Upload, FileSpreadsheet, SlidersHorizontal, X } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils';
import { exportAssetsToExcel, importAssetsFromExcel, downloadAssetTemplate, exportDepreciationReport, exportCategoryReport } from '../utils-excel';

interface AssetListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onView: (asset: Asset) => void;
  onReload?: () => void; // 가져오기 후 목록 새로고침
}

type SortField = 'name' | 'purchaseDate' | 'purchasePrice' | 'status';
type SortOrder = 'asc' | 'desc';

const AssetList = ({ assets, onEdit, onDelete, onView, onReload }: AssetListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AssetStatus | 'all'>('all');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 고급 필터
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('purchaseDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 등록된 자산의 카테고리만 추출 (동적 필터)
  const availableCategories = Array.from(new Set(assets.map(a => a.category)));
  
  // 카테고리 한글 이름 매핑
  const categoryNames: Record<AssetCategory, string> = {
    'PC': 'PC (데스크톱)',
    'Laptop': '노트북',
    'Monitor': '모니터',
    'Keyboard': '키보드',
    'Mouse': '마우스',
    'Printer': '프린터',
    'Tablet': '태블릿',
    'Phone': '휴대폰',
    'Cable': '케이블',
    'Other': '기타',
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    
    // 가격 범위 필터
    const minPrice = priceMin ? parseFloat(priceMin) : 0;
    const maxPrice = priceMax ? parseFloat(priceMax) : Infinity;
    const matchesPrice = asset.purchasePrice >= minPrice && asset.purchasePrice <= maxPrice;

    // 날짜 범위 필터
    const fromDate = dateFrom ? new Date(dateFrom) : new Date(0);
    const toDate = dateTo ? new Date(dateTo) : new Date();
    const assetDate = new Date(asset.purchaseDate);
    const matchesDate = assetDate >= fromDate && assetDate <= toDate;

    // 위치 필터
    const matchesLocation = !locationFilter || 
      asset.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesStatus && 
           matchesPrice && matchesDate && matchesLocation;
  })
  // 정렬
  .sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'purchaseDate':
        comparison = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
        break;
      case 'purchasePrice':
        comparison = a.purchasePrice - b.purchasePrice;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterStatus('all');
    setPriceMin('');
    setPriceMax('');
    setDateFrom('');
    setDateTo('');
    setLocationFilter('');
    setSortField('purchaseDate');
    setSortOrder('desc');
  };

  // 활성 필터 카운트
  const activeFiltersCount = [
    searchTerm,
    filterCategory !== 'all',
    filterStatus !== 'all',
    priceMin,
    priceMax,
    dateFrom,
    dateTo,
    locationFilter,
  ].filter(Boolean).length;

  // Excel 내보내기
  const handleExport = () => {
    const success = exportAssetsToExcel(filteredAssets);
    if (success) {
      alert('Excel 파일이 다운로드되었습니다.');
    } else {
      alert('Excel 내보내기에 실패했습니다.');
    }
  };

  // Excel 템플릿 다운로드
  const handleDownloadTemplate = () => {
    const success = downloadAssetTemplate();
    if (success) {
      alert('템플릿 파일이 다운로드되었습니다.');
    } else {
      alert('템플릿 다운로드에 실패했습니다.');
    }
  };

  // Excel 가져오기
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importAssetsFromExcel(file);
      
      if (result.success) {
        let message = `${result.imported}개의 자산이 성공적으로 등록되었습니다.`;
        if (result.errors.length > 0) {
          message += `\n\n${result.errors.length}개의 오류가 발생했습니다:\n${result.errors.slice(0, 5).join('\n')}`;
          if (result.errors.length > 5) {
            message += `\n... 외 ${result.errors.length - 5}개`;
          }
        }
        alert(message);
        
        // 목록 새로고침
        if (onReload) {
          onReload();
        }
      } else {
        alert(`가져오기 실패:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Excel 가져오기 실패:', error);
      alert('Excel 가져오기 중 오류가 발생했습니다.');
    } finally {
      setIsImporting(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">자산 목록</h2>
        
        {/* Excel 내보내기/가져오기 버튼 */}
        <div className="flex gap-2 flex-wrap">
          {/* Excel 보고서 다운로드 버튼 */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              title="Excel 보고서"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel 보고서
            </button>
            
            {/* Excel 보고서 드롭다운 메뉴 */}
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => exportAssetsToExcel(filteredAssets)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-t-lg"
              >
                📄 자산 목록
              </button>
              <button
                onClick={() => exportDepreciationReport(filteredAssets)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                📊 감가상각 보고서
              </button>
              <button
                onClick={() => exportCategoryReport(filteredAssets)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-b-lg"
              >
                📈 카테고리별 통계
              </button>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="자산 목록 Excel 다운로드"
          >
            <Download className="w-4 h-4" />
            Excel 내보내기
          </button>
          
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            title="Excel 템플릿 다운로드"
          >
            <FileSpreadsheet className="w-4 h-4" />
            템플릿 다운로드
          </button>
          
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Excel에서 자산 가져오기"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? '가져오는 중...' : 'Excel 가져오기'}
          </button>
          
          {/* 숨겨진 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      
      {/* 검색 및 필터 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="자산명, 시리얼 번호, 제조사 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as AssetCategory | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">모든 카테고리</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {categoryNames[category]}
              </option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as AssetStatus | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">모든 상태</option>
            <option value="available">사용 가능</option>
            <option value="in-use">사용 중</option>
            <option value="maintenance">점검 중</option>
            <option value="disposed">폐기</option>
          </select>
        </div>

        {/* 고급 필터 토글 버튼 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            고급 필터
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              필터 초기화
            </button>
          )}
        </div>

        {/* 고급 필터 패널 */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">고급 검색 옵션</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 가격 범위 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  가격 범위
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="최소"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="flex items-center text-gray-500">~</span>
                  <input
                    type="number"
                    placeholder="최대"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* 구매 기간 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  구매 기간
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="flex items-center text-gray-500">~</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* 위치 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  위치
                </label>
                <input
                  type="text"
                  placeholder="위치 검색..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* 정렬 기준 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  정렬 기준
                </label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="purchaseDate">구매일</option>
                  <option value="name">자산명</option>
                  <option value="purchasePrice">구매금액</option>
                  <option value="status">상태</option>
                </select>
              </div>

              {/* 정렬 순서 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  정렬 순서
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="asc">오름차순</option>
                  <option value="desc">내림차순</option>
                </select>
              </div>
            </div>

            {/* 검색 결과 요약 */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredAssets.length}</span>
                개의 자산이 검색되었습니다
                {activeFiltersCount > 0 && (
                  <span className="ml-1">
                    ({activeFiltersCount}개 필터 활성)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 자산 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              검색 결과가 없습니다.
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    자산명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    시리얼 번호
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    제조사
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    구매일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    구매금액
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    위치
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {asset.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {asset.category}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {asset.serialNumber}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {asset.manufacturer}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(asset.purchaseDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {formatCurrency(asset.purchasePrice)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        asset.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        asset.status === 'in-use' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        asset.status === 'maintenance' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {asset.status === 'available' ? '사용가능' :
                         asset.status === 'in-use' ? '사용중' :
                         asset.status === 'maintenance' ? '점검중' : '폐기'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {asset.location}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onView(asset)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="상세보기"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(asset)}
                          className="text-green-600 hover:text-green-900"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('정말 삭제하시겠습니까?')) {
                              onDelete(asset.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        총 {filteredAssets.length}개의 자산
      </div>
    </div>
  );
};

export default AssetList;
