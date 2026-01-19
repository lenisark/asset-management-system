import type { Asset, Transaction, MaintenanceSchedule } from '../types';
import { X, ArrowUpCircle, ArrowDownCircle, Calendar, User, Building, QrCode, Wrench, Plus } from 'lucide-react';
import { formatDate, formatCurrency, getTransactionsByAssetId, getMaintenanceSchedulesByAssetId, saveMaintenanceSchedule, deleteMaintenanceSchedule } from '../utils-supabase';
import { useState, useEffect } from 'react';
import QRCodeModal from './QRCodeModal';
import MaintenanceForm from './MaintenanceForm';

interface AssetDetailProps {
  asset: Asset;
  onClose: () => void;
  onTransaction: () => void;
}

const AssetDetail = ({ asset, onClose, onTransaction }: AssetDetailProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | undefined>();

  useEffect(() => {
    const loadData = async () => {
      const txData = await getTransactionsByAssetId(asset.id);
      setTransactions(txData);
      
      const mData = await getMaintenanceSchedulesByAssetId(asset.id);
      setMaintenanceSchedules(mData);
    };
    loadData();
  }, [asset.id]);

  const handleSaveMaintenance = async (schedule: MaintenanceSchedule) => {
    const success = await saveMaintenanceSchedule(schedule);
    if (success) {
      const mData = await getMaintenanceSchedulesByAssetId(asset.id);
      setMaintenanceSchedules(mData);
      setShowMaintenanceForm(false);
      setSelectedSchedule(undefined);
      alert('유지보수 일정이 저장되었습니다.');
    } else {
      alert('저장에 실패했습니다.');
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const success = await deleteMaintenanceSchedule(id);
    if (success) {
      const mData = await getMaintenanceSchedulesByAssetId(asset.id);
      setMaintenanceSchedules(mData);
      alert('삭제되었습니다.');
    } else {
      alert('삭제에 실패했습니다.');
    }
  };

  const getMaintenanceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      inspection: '점검',
      repair: '수리',
      cleaning: '청소',
      upgrade: '업그레이드',
      other: '기타',
    };
    return types[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      scheduled: '예정됨',
      'in-progress': '진행중',
      completed: '완료',
      cancelled: '취소됨',
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">자산 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">기본 정보</h3>
            
            {/* 자산 이미지 */}
            {asset.imageUrl && (
              <div className="mb-4">
                <img 
                  src={asset.imageUrl} 
                  alt={asset.name}
                  className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">자산명</p>
                <p className="text-base font-semibold text-gray-800 dark:text-white">{asset.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">카테고리</p>
                <p className="text-base font-semibold text-gray-800 dark:text-white">{asset.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">시리얼 번호</p>
                <p className="text-base font-mono text-gray-800 dark:text-white">{asset.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">제조사</p>
                <p className="text-base font-semibold text-gray-800 dark:text-white">{asset.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">구매일</p>
                <p className="text-base text-gray-800 dark:text-white">{formatDate(asset.purchaseDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">구매금액</p>
                <p className="text-base font-semibold text-gray-800 dark:text-white">{formatCurrency(asset.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">상태</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">위치</p>
                <p className="text-base text-gray-800 dark:text-white">{asset.location}</p>
              </div>
            </div>
            {asset.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">비고</p>
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
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{transaction.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 유지보수 스케줄 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                유지보수 스케줄
              </h3>
              <button
                onClick={() => {
                  setSelectedSchedule(undefined);
                  setShowMaintenanceForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                일정 등록
              </button>
            </div>

            {maintenanceSchedules.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center">
                <Wrench className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">등록된 유지보수 일정이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {maintenanceSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(schedule.status)}`}>
                            {getStatusLabel(schedule.status)}
                          </span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {getMaintenanceTypeLabel(schedule.type)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>예정: {formatDate(schedule.scheduledDate)}</span>
                          </div>
                          {schedule.completedDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>완료: {formatDate(schedule.completedDate)}</span>
                            </div>
                          )}
                          {schedule.assignedTo && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{schedule.assignedTo}</span>
                            </div>
                          )}
                          {schedule.cost && (
                            <div className="flex items-center gap-2">
                              <span>비용: {formatCurrency(schedule.cost)}</span>
                            </div>
                          )}
                        </div>
                        {schedule.notes && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{schedule.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowMaintenanceForm(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteMaintenance(schedule.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => setShowQRCode(true)}
              className="flex items-center gap-2 px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <QrCode className="w-5 h-5" />
              QR 코드
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
      
      {/* QR 코드 모달 */}
      {showQRCode && (
        <QRCodeModal asset={asset} onClose={() => setShowQRCode(false)} />
      )}
      
      {/* 유지보수 일정 폼 */}
      {showMaintenanceForm && (
        <MaintenanceForm
          schedule={selectedSchedule}
          assetId={asset.id}
          assetName={asset.name}
          onSave={handleSaveMaintenance}
          onCancel={() => {
            setShowMaintenanceForm(false);
            setSelectedSchedule(undefined);
          }}
        />
      )}
    </div>
  );
};

export default AssetDetail;
