import { useState, useEffect } from 'react';
import type { MaintenanceSchedule, MaintenanceType, MaintenanceStatus } from '../types';
import { X, Calendar, User, DollarSign } from 'lucide-react';
import { generateId } from '../utils-supabase';

interface MaintenanceFormProps {
  schedule?: MaintenanceSchedule;
  assetId: string;
  assetName: string;
  onSave: (schedule: MaintenanceSchedule) => void;
  onCancel: () => void;
}

const MaintenanceForm = ({ schedule, assetId, assetName, onSave, onCancel }: MaintenanceFormProps) => {
  const [formData, setFormData] = useState<Omit<MaintenanceSchedule, 'id' | 'createdAt' | 'updatedAt'>>({
    assetId,
    assetName,
    type: 'inspection',
    scheduledDate: new Date().toISOString().split('T')[0],
    completedDate: undefined,
    status: 'scheduled',
    assignedTo: '',
    notes: '',
    cost: undefined,
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        assetId: schedule.assetId,
        assetName: schedule.assetName,
        type: schedule.type,
        scheduledDate: schedule.scheduledDate,
        completedDate: schedule.completedDate,
        status: schedule.status,
        assignedTo: schedule.assignedTo || '',
        notes: schedule.notes || '',
        cost: schedule.cost,
      });
    }
  }, [schedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const maintenanceSchedule: MaintenanceSchedule = {
      id: schedule?.id || generateId(),
      assetId: formData.assetId,
      assetName: formData.assetName,
      type: formData.type,
      scheduledDate: formData.scheduledDate,
      completedDate: formData.completedDate,
      status: formData.status,
      assignedTo: formData.assignedTo || undefined,
      notes: formData.notes || undefined,
      cost: formData.cost,
      createdAt: schedule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(maintenanceSchedule);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cost' ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const maintenanceTypes: { value: MaintenanceType; label: string }[] = [
    { value: 'inspection', label: '점검' },
    { value: 'repair', label: '수리' },
    { value: 'cleaning', label: '청소' },
    { value: 'upgrade', label: '업그레이드' },
    { value: 'other', label: '기타' },
  ];

  const statuses: { value: MaintenanceStatus; label: string }[] = [
    { value: 'scheduled', label: '예정됨' },
    { value: 'in-progress', label: '진행중' },
    { value: 'completed', label: '완료' },
    { value: 'cancelled', label: '취소됨' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {schedule ? '유지보수 일정 수정' : '유지보수 일정 등록'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              자산: {assetName}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              유지보수 유형 *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {maintenanceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* 예정일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              예정일 *
            </label>
            <input
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              상태 *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* 완료일 (상태가 completed일 때만) */}
          {formData.status === 'completed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                완료일
              </label>
              <input
                type="date"
                name="completedDate"
                value={formData.completedDate || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* 담당자 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              담당자
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="담당자명을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* 비용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              비용 (원)
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost || ''}
              onChange={handleChange}
              placeholder="비용을 입력하세요"
              min="0"
              step="1000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* 비고 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              비고
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="추가 정보를 입력하세요..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {schedule ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;
