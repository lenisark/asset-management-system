import { useState, useEffect } from 'react';
import { Asset } from './types';
import { getAssets, saveAsset, deleteAsset } from './utils-supabase';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import AssetForm from './components/AssetForm';
import AssetDetail from './components/AssetDetail';
import TransactionForm from './components/TransactionForm';
import { LayoutDashboard, Package, Plus, AlertCircle } from 'lucide-react';

type View = 'dashboard' | 'assets';

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showAssetDetail, setShowAssetDetail] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

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
      const success = await saveAsset(asset);
      if (success) {
        await loadAssets();
        setShowAssetForm(false);
        setSelectedAsset(undefined);
      } else {
        alert('자산 저장에 실패했습니다.');
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
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              자산관리 시스템 (Supabase)
            </h1>
            <button
              onClick={handleNewAsset}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              자산 등록
            </button>
          </div>
        </div>
      </header>

      {/* 에러 메시지 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
            <p className="text-sm text-red-600 mt-2">
              .env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정해주세요.
            </p>
          </div>
        </div>
      )}

      {/* 네비게이션 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-3 py-4 border-b-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              대시보드
            </button>
            <button
              onClick={() => setCurrentView('assets')}
              className={`flex items-center gap-2 px-3 py-4 border-b-2 transition-colors ${
                currentView === 'assets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
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
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2024 자산관리 시스템. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
