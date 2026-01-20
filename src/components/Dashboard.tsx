import type { Asset, AssetCategory, DashboardStats } from '../types';
import { Package, Monitor, Laptop, Wrench, Box, FileSpreadsheet } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { exportAssetsToExcel, exportDepreciationReport, exportCategoryReport } from '../utils-excel';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  LineChart, 
  Line, 
  BarChart as RechartsBar, 
  Bar as RechartsBarElement,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  getMonthlyPurchaseData, 
  getAssetValueTrendData, 
  formatMonthLabel,
  formatCurrency 
} from '../utils-dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardProps {
  assets: Asset[];
}

const Dashboard = ({ assets }: DashboardProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats: DashboardStats = {
    totalAssets: assets.length,
    availableAssets: assets.filter(a => a.status === 'available').length,
    inUseAssets: assets.filter(a => a.status === 'in-use').length,
    maintenanceAssets: assets.filter(a => a.status === 'maintenance').length,
    assetsByCategory: {
      PC: assets.filter(a => a.category === 'PC').length,
      Monitor: assets.filter(a => a.category === 'Monitor').length,
      Keyboard: assets.filter(a => a.category === 'Keyboard').length,
      Mouse: assets.filter(a => a.category === 'Mouse').length,
      Printer: assets.filter(a => a.category === 'Printer').length,
      Laptop: assets.filter(a => a.category === 'Laptop').length,
      Tablet: assets.filter(a => a.category === 'Tablet').length,
      Phone: assets.filter(a => a.category === 'Phone').length,
      Cable: assets.filter(a => a.category === 'Cable').length,
      Other: assets.filter(a => a.category === 'Other').length,
    }
  };

  // Recharts 데이터 준비
  const monthlyPurchaseData = getMonthlyPurchaseData(assets);
  const assetValueTrendData = getAssetValueTrendData(assets);

  const categoryIcons: Record<AssetCategory, React.ReactNode> = {
    PC: <Laptop className="w-6 h-6" />,
    Monitor: <Monitor className="w-6 h-6" />,
    Keyboard: <Box className="w-6 h-6" />,
    Mouse: <Box className="w-6 h-6" />,
    Printer: <Package className="w-6 h-6" />,
    Laptop: <Laptop className="w-6 h-6" />,
    Tablet: <Monitor className="w-6 h-6" />,
    Phone: <Package className="w-6 h-6" />,
    Cable: <Box className="w-6 h-6" />,
    Other: <Package className="w-6 h-6" />,
  };

  // 상태별 차트 데이터
  const statusChartData = {
    labels: ['사용 가능', '사용 중', '점검 중'],
    datasets: [
      {
        label: '자산 수',
        data: [stats.availableAssets, stats.inUseAssets, stats.maintenanceAssets],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 카테고리별 차트 데이터
  const categoryChartData = {
    labels: ['PC', 'Monitor', 'Keyboard', 'Mouse', 'Other'],
    datasets: [
      {
        label: '자산 수',
        data: [
          stats.assetsByCategory.PC,
          stats.assetsByCategory.Monitor,
          stats.assetsByCategory.Keyboard,
          stats.assetsByCategory.Mouse,
          stats.assetsByCategory.Other,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">대시보드</h2>
        
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
              onClick={() => exportAssetsToExcel(assets)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-t-lg"
            >
              📄 자산 목록
            </button>
            <button
              onClick={() => exportDepreciationReport(assets)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              📊 감가상각 보고서
            </button>
            <button
              onClick={() => exportCategoryReport(assets)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-b-lg"
            >
              📈 카테고리별 통계
            </button>
          </div>
        </div>
      </div>
      
      {/* 상태별 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">전체 자산</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalAssets}</p>
            </div>
            <Package className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">사용 가능</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.availableAssets}</p>
            </div>
            <Box className="w-10 h-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">사용 중</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.inUseAssets}</p>
            </div>
            <Laptop className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">점검 중</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.maintenanceAssets}</p>
            </div>
            <Wrench className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 상태별 파이 차트 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">자산 상태 분포</h3>
          <div className="h-64">
            <Pie data={statusChartData} options={chartOptions} />
          </div>
        </div>

        {/* 카테고리별 바 차트 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">카테고리별 자산</h3>
          <div className="h-64">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recharts 그래프 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 자산 가치 추이 그래프 (Line Chart) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            자산 가치 추이 (감가상각 반영)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={assetValueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="month" 
                tickFormatter={formatMonthLabel}
                stroke={isDark ? '#9ca3af' : '#6b7280'}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
                stroke={isDark ? '#9ca3af' : '#6b7280'}
              />
              <RechartsTooltip 
                formatter={(value) => [formatCurrency(Number(value)), '자산 가치']}
                labelFormatter={formatMonthLabel}
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : '#fff', 
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  color: isDark ? '#f9fafb' : '#111827'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 월별 구매 금액 그래프 (Bar Chart) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            월별 구매 금액
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={monthlyPurchaseData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="month" 
                tickFormatter={formatMonthLabel}
                stroke={isDark ? '#9ca3af' : '#6b7280'}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
                stroke={isDark ? '#9ca3af' : '#6b7280'}
              />
              <RechartsTooltip 
                formatter={(value) => [formatCurrency(Number(value)), '구매 금액']}
                labelFormatter={formatMonthLabel}
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : '#fff', 
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  color: isDark ? '#f9fafb' : '#111827'
                }}
              />
              <RechartsBarElement 
                dataKey="amount" 
                fill="#10b981" 
                radius={[8, 8, 0, 0]}
              />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 카테고리별 통계 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">카테고리별 자산</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(Object.keys(stats.assetsByCategory) as AssetCategory[]).map(category => (
            <div key={category} className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400 mb-2">
                {categoryIcons[category]}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{category}</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{stats.assetsByCategory[category]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 자산 목록 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">최근 등록 자산</h3>
        {assets.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">등록된 자산이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">자산명</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">카테고리</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">제조사</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">상태</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">위치</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {assets.slice(0, 5).map(asset => (
                  <tr key={asset.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{asset.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{asset.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{asset.manufacturer}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{asset.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
