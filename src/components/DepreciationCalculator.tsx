import { useState, useEffect } from 'react';
import type { Asset, Depreciation } from '../types';
import { X, TrendingDown, DollarSign, Calendar, Info } from 'lucide-react';
import {
  calculateDepreciation,
  generateDepreciationSchedule,
  getRecommendedUsefulLife,
  estimateSalvageValue,
  calculateDepreciationRate,
} from '../utils-depreciation';
import { formatCurrency } from '../utils-supabase';
import type { DepreciationSchedule } from '../utils-depreciation';

interface DepreciationCalculatorProps {
  asset: Asset;
  onClose: () => void;
}

const DepreciationCalculator = ({ asset, onClose }: DepreciationCalculatorProps) => {
  const [usefulLife, setUsefulLife] = useState(getRecommendedUsefulLife(asset.category));
  const [salvageValue, setSalvageValue] = useState(estimateSalvageValue(asset.purchasePrice));
  const [method, setMethod] = useState<'straight-line' | 'declining-balance'>('straight-line');
  const [depreciation, setDepreciation] = useState<Depreciation | null>(null);
  const [schedule, setSchedule] = useState<DepreciationSchedule[]>([]);

  useEffect(() => {
    calculateAndUpdate();
  }, [usefulLife, salvageValue, method]);

  const calculateAndUpdate = () => {
    const result = calculateDepreciation(
      asset.id,
      asset.name,
      asset.purchasePrice,
      asset.purchaseDate,
      salvageValue,
      usefulLife,
      method
    );
    setDepreciation(result);
    setSchedule(generateDepreciationSchedule(result));
  };

  const depreciationRate = calculateDepreciationRate(usefulLife);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-6 h-6" />
              감가상각 계산
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              자산: {asset.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 설정 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">감가상각이란?</p>
                <p>자산의 사용으로 인한 가치 감소를 회계적으로 인식하는 방법입니다.</p>
              </div>
            </div>
          </div>

          {/* 계산 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                감가상각 방법
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'straight-line' | 'declining-balance')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="straight-line">정액법 (균등 상각)</option>
                <option value="declining-balance">정률법 (체감 상각)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                내용연수 (년)
              </label>
              <input
                type="number"
                value={usefulLife}
                onChange={(e) => setUsefulLife(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="50"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                권장: {getRecommendedUsefulLife(asset.category)}년
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                잔존가치 (원)
              </label>
              <input
                type="number"
                value={salvageValue}
                onChange={(e) => setSalvageValue(Math.max(0, parseFloat(e.target.value) || 0))}
                min="0"
                step="10000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                권장: {formatCurrency(estimateSalvageValue(asset.purchasePrice))}
              </p>
            </div>
          </div>

          {/* 현재 상태 */}
          {depreciation && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 opacity-80" />
                    <span className="text-xs opacity-80">취득원가</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(depreciation.purchasePrice)}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingDown className="w-5 h-5 opacity-80" />
                    <span className="text-xs opacity-80">현재 장부가액</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(depreciation.currentValue)}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingDown className="w-5 h-5 opacity-80" />
                    <span className="text-xs opacity-80">감가상각 누계액</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(depreciation.accumulatedDepreciation)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-5 h-5 opacity-80" />
                    <span className="text-xs opacity-80">감가상각율</span>
                  </div>
                  <p className="text-2xl font-bold">{depreciationRate.toFixed(2)}%</p>
                </div>
              </div>

              {/* 감가상각 스케줄 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  연도별 감가상각 스케줄
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          연도
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          기초 장부가액
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          감가상각비
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          감가상각 누계액
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          기말 장부가액
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {schedule.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {row.year}년차
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            {formatCurrency(row.beginningBookValue)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-orange-600 dark:text-orange-400 font-medium">
                            {formatCurrency(row.depreciation)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            {formatCurrency(row.accumulatedDepreciation)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white font-medium">
                            {formatCurrency(row.endingBookValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 요약 정보 */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">요약</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">방법:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {method === 'straight-line' ? '정액법' : '정률법'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">내용연수:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{usefulLife}년</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">잔존가치:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(salvageValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">총 감가상각비:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(depreciation.purchasePrice - salvageValue)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepreciationCalculator;
