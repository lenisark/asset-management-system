// 자산 타입 정의
export type AssetCategory = 'PC' | 'Monitor' | 'Keyboard' | 'Mouse' | 'Other';

export type AssetStatus = 'available' | 'in-use' | 'maintenance' | 'disposed';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  manufacturer: string;
  purchaseDate: string;
  purchasePrice: number;
  status: AssetStatus;
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  assetId: string;
  type: 'checkout' | 'checkin';
  employeeName: string;
  department: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  inUseAssets: number;
  maintenanceAssets: number;
  assetsByCategory: Record<AssetCategory, number>;
}
