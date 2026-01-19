import { useState } from 'react';
import { Asset, AssetCategory, AssetStatus } from '../types';
import { Search, Edit, Trash2, Eye } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils';

interface AssetListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onView: (asset: Asset) => void;
}

const AssetList = ({ assets, onEdit, onDelete, onView }: AssetListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AssetStatus | 'all'>('all');

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">자산 목록</h2>
      
      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="자산명, 시리얼 번호, 제조사 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as AssetCategory | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">모든 카테고리</option>
            <option value="PC">PC</option>
            <option value="Monitor">모니터</option>
            <option value="Keyboard">키보드</option>
            <option value="Mouse">마우스</option>
            <option value="Other">기타</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as AssetStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">모든 상태</option>
            <option value="available">사용 가능</option>
            <option value="in-use">사용 중</option>
            <option value="maintenance">점검 중</option>
            <option value="disposed">폐기</option>
          </select>
        </div>
      </div>

      {/* 자산 테이블 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    자산명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시리얼 번호
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제조사
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    구매일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    구매금액
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    위치
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {asset.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {asset.category}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-mono">
                      {asset.serialNumber}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {asset.manufacturer}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(asset.purchaseDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatCurrency(asset.purchasePrice)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        asset.status === 'available' ? 'bg-green-100 text-green-800' :
                        asset.status === 'in-use' ? 'bg-orange-100 text-orange-800' :
                        asset.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {asset.status === 'available' ? '사용가능' :
                         asset.status === 'in-use' ? '사용중' :
                         asset.status === 'maintenance' ? '점검중' : '폐기'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {asset.location}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onView(asset)}
                          className="text-blue-600 hover:text-blue-900"
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
