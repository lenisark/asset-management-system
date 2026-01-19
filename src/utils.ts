import { Asset, Transaction } from './types';

const ASSETS_KEY = 'company_assets';
const TRANSACTIONS_KEY = 'asset_transactions';

// 자산 관리
export const getAssets = (): Asset[] => {
  const data = localStorage.getItem(ASSETS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAsset = (asset: Asset): void => {
  const assets = getAssets();
  const index = assets.findIndex(a => a.id === asset.id);
  
  if (index >= 0) {
    assets[index] = { ...asset, updatedAt: new Date().toISOString() };
  } else {
    assets.push(asset);
  }
  
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
};

export const deleteAsset = (id: string): void => {
  const assets = getAssets().filter(a => a.id !== id);
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
};

export const getAssetById = (id: string): Asset | undefined => {
  return getAssets().find(a => a.id === id);
};

// 거래 내역 관리
export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getTransactionsByAssetId = (assetId: string): Transaction[] => {
  return getTransactions()
    .filter(t => t.assetId === assetId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// UUID 생성
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 날짜 포맷팅
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 금액 포맷팅
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
};
