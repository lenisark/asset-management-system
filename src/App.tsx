import { useState, useEffect } from 'react';
import { Asset } from './types';
import { getAssets, saveAsset, deleteAsset } from './utils';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import AssetForm from './components/AssetForm';
import AssetDetail from './components/AssetDetail';
import TransactionForm from './components/TransactionForm';
import { LayoutDashboard, Package, Plus } from 'lucide-react';

type View = 'dashboard' | 'assets';

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showAssetDetail, setShowAssetDetail] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = () => {
    setAssets(getAssets());
  };

  const handleSaveAsset = (asset: Asset) => {
    saveAsset(asset);
    loadAssets();
    setShowAssetForm(false);
    setSelectedAsset(undefined);
  };

  const handleDeleteAsset = (id: string) => {
    deleteAsset(id);
    loadAssets();
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

  const handleTransactionComplete = () => {
    loadAssets();
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
              자산관리 시스템
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
        {currentView === 'dashboard' && <Dashboard assets={assets} />}
        {currentView === 'assets' && (
          <AssetList
            assets={assets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
            onView={handleViewAsset}
          />
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
