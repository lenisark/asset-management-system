import { useState, useEffect } from 'react';
import type { Asset } from './types';
import { getAssets, saveAsset, deleteAsset } from './utils-supabase';
import { supabase, TABLES } from './supabaseClient';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import AssetForm from './components/AssetForm';
import AssetDetail from './components/AssetDetail';
import TransactionForm from './components/TransactionForm';
import { NotificationBell } from './components/NotificationBell';
import { LayoutDashboard, Package, Plus, AlertCircle, Wifi, LogOut, User, Moon, Sun } from 'lucide-react';

type View = 'dashboard' | 'assets';

function App() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showAssetDetail, setShowAssetDetail] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtime, setIsRealtime] = useState(false);

  useEffect(() => {
    // 사용자가 로그인되어 있을 때만 자산 로드
    if (user) {
      loadAssets();
      
      // Supabase Realtime 구독
      const channel = supabase
        .channel('assets-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: TABLES.ASSETS },
          (payload) => {
            console.log('Realtime change:', payload);
            setIsRealtime(true);
            setTimeout(() => setIsRealtime(false), 2000);
            
            if (payload.eventType === 'INSERT') {
              loadAssets(); // 새 자산 추가 시 전체 재로드
            } else if (payload.eventType === 'UPDATE') {
              loadAssets(); // 자산 업데이트 시 전체 재로드
            } else if (payload.eventType === 'DELETE') {
              loadAssets(); // 자산 삭제 시 전체 재로드
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });

      // 클린업
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // 인증되지 않은 경우 로그인 페이지 표시 (모든 Hook 이후)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      console.error('Error loading assets:', err);
      setError('자산 목록을 불러오는데 실패했습니다. Supabase 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsset = async (asset: Asset) => {
    try {
      const result = await saveAsset(asset);
      if (result.success) {
        await loadAssets();
        setShowAssetForm(false);
        setSelectedAsset(undefined);
      } else {
        alert(result.error || '자산 저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error saving asset:', err);
      alert('자산 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const success = await deleteAsset(id);
      if (success) {
        await loadAssets();
      } else {
        alert('자산 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error deleting asset:', err);
      alert('자산 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetForm(true);
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetDetail(true);
  };

  const handleNewAsset = () => {
    setSelectedAsset(undefined);
    setShowAssetForm(true);
  };

  const handleTransaction = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowTransactionForm(true);
  };

  const handleTransactionComplete = async () => {
    await loadAssets();
    setShowTransactionForm(false);
    setShowAssetDetail(false);
    setSelectedAsset(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                자산관리 시스템
              </h1>
              {/* 실시간 동기화 상태 */}
              <div className="flex items-center gap-1 text-sm">
                {isRealtime ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 animate-pulse">
                    <Wifi className="w-4 h-4" />
                    <span>동기화 중</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                    <Wifi className="w-4 h-4" />
                    <span>실시간</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* 사용자 정보 */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              {/* 알림 벨 */}
              <NotificationBell />
              {/* 테마 전환 버튼 */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              {/* 자산 등록 버튼 */}
              <button
                onClick={handleNewAsset}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                자산 등록
              </button>
              {/* 로그아웃 버튼 */}
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 에러 메시지 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              .env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정해주세요.
            </p>
          </div>
        </div>
      )}

      {/* 네비게이션 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-3 py-4 border-b-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              대시보드
            </button>
            <button
              onClick={() => setCurrentView('assets')}
              className={`flex items-center gap-2 px-3 py-4 border-b-2 transition-colors ${
                currentView === 'assets'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Package className="w-5 h-5" />
              자산 목록
            </button>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && <Dashboard assets={assets} />}
            {currentView === 'assets' && (
              <AssetList
                assets={assets}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
                onView={handleViewAsset}
                onReload={loadAssets}
              />
            )}
          </>
        )}
      </main>

      {/* 모달들 */}
      {showAssetForm && (
        <AssetForm
          asset={selectedAsset}
          onSave={handleSaveAsset}
          onCancel={() => {
            setShowAssetForm(false);
            setSelectedAsset(undefined);
          }}
        />
      )}

      {showAssetDetail && selectedAsset && (
        <AssetDetail
          asset={selectedAsset}
          onClose={() => {
            setShowAssetDetail(false);
            setSelectedAsset(undefined);
          }}
          onTransaction={() => {
            setShowAssetDetail(false);
            handleTransaction(selectedAsset);
          }}
        />
      )}

      {showTransactionForm && selectedAsset && (
        <TransactionForm
          asset={selectedAsset}
          onComplete={handleTransactionComplete}
          onCancel={() => {
            setShowTransactionForm(false);
            setSelectedAsset(undefined);
          }}
        />
      )}

      {/* 푸터 */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} DSAuto. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
