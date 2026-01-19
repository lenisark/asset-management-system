import { useState } from 'react';
import { Asset, Transaction } from '../types';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { generateId, saveTransaction, saveAsset } from '../utils-supabase';

interface TransactionFormProps {
  asset: Asset;
  onComplete: () => void;
  onCancel: () => void;
}

const TransactionForm = ({ asset, onComplete, onCancel }: TransactionFormProps) => {
  const [type, setType] = useState<'checkout' | 'checkin'>('checkout');
  const [formData, setFormData] = useState({
    employeeName: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction: Transaction = {
      id: generateId(),
      assetId: asset.id,
      type,
      employeeName: formData.employeeName,
      department: formData.department,
      date: formData.date,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };
    
    await saveTransaction(transaction);
    
    // 자산 상태 업데이트
    const updatedAsset: Asset = {
      ...asset,
      status: type === 'checkout' ? 'in-use' : 'available',
      updatedAt: new Date().toISOString(),
    };
    
    await saveAsset(updatedAsset);
    onComplete();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {type === 'checkout' ? '불출 등록' : '입고 등록'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 자산 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">자산명</p>
            <p className="font-semibold text-gray-800">{asset.name}</p>
            <p className="text-sm text-gray-600 mt-2">시리얼 번호</p>
            <p className="font-mono text-sm text-gray-800">{asset.serialNumber}</p>
          </div>

          {/* 거래 유형 선택 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setType('checkout')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                type === 'checkout'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <ArrowUpCircle className={`w-8 h-8 mx-auto mb-2 ${
                type === 'checkout' ? 'text-orange-500' : 'text-gray-400'
              }`} />
              <p className="font-semibold text-center">불출</p>
            </button>
            <button
              type="button"
              onClick={() => setType('checkin')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                type === 'checkin'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <ArrowDownCircle className={`w-8 h-8 mx-auto mb-2 ${
                type === 'checkin' ? 'text-green-500' : 'text-gray-400'
              }`} />
              <p className="font-semibold text-center">입고</p>
            </button>
          </div>

          {/* 폼 필드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              담당자명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              부서 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="개발팀"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비고
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="추가 정보 입력..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg ${
                type === 'checkout'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
