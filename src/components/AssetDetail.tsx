import { Asset, Transaction } from '../types';
import { X, ArrowUpCircle, ArrowDownCircle, Calendar, User, Building } from 'lucide-react';
import { formatDate, formatCurrency, getTransactionsByAssetId } from '../utils';
import { useState, useEffect } from 'react';

interface AssetDetailProps {
  asset: Asset;
  onClose: () => void;
  onTransaction: () => void;
}

const AssetDetail = ({ asset, onClose, onTransaction }: AssetDetailProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(getTransactionsByAssetId(asset.id));
  }, [asset.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">자산 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">기본 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">자산명</p>
                <p className="text-base font-semibold text-gray-800">{asset.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">카테고리</p>
                <p className="text-base font-semibold text-gray-800">{asset.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">시리얼 번호</p>
                <p className="text-base font-mono text-gray-800">{asset.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">제조사</p>
                <p className="text-base font-semibold text-gray-800">{asset.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">구매일</p>
                <p className="text-base text-gray-800">{formatDate(asset.purchaseDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">구매금액</p>
                <p className="text-base font-semibold text-gray-800">{formatCurrency(asset.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">상태</p>
                <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                  asset.status === 'available' ? 'bg-green-100 text-green-800' :
                  asset.status === 'in-use' ? 'bg-orange-100 text-orange-800' :
                  asset.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {asset.status === 'available' ? '사용가능' :
                   asset.status === 'in-use' ? '사용중' :
                   asset.status === 'maintenance' ? '점검중' : '폐기'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">위치</p>
                <p className="text-base text-gray-800">{asset.location}</p>
              </div>
            </div>
            {asset.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">비고</p>
                <p className="text-base text-gray-800 whitespace-pre-wrap">{asset.notes}</p>
              </div>
            )}
          </div>

          {/* 불출/입고 이력 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">불출/입고 이력</h3>
              <button
                onClick={onTransaction}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                불출/입고 등록
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                거래 이력이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`border-l-4 p-4 rounded-lg ${
                      transaction.type === 'checkout'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-green-500 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {transaction.type === 'checkout' ? (
                            <>
                              <ArrowUpCircle className="w-5 h-5 text-orange-600" />
                              <span className="font-semibold text-orange-900">불출</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownCircle className="w-5 h-5 text-green-600" />
                              <span className="font-semibold text-green-900">입고</span>
                            </>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">{transaction.employeeName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">{transaction.department}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                        {transaction.notes && (
                          <p className="mt-2 text-sm text-gray-600">{transaction.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
