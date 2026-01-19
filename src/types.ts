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
  imageUrl?: string; // 자산 이미지 URL
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

export type MaintenanceType = 'inspection' | 'repair' | 'cleaning' | 'upgrade' | 'other';
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface MaintenanceSchedule {
  id: string;
  assetId: string;
  assetName?: string; // join용
  type: MaintenanceType;
  scheduledDate: string;
  completedDate?: string;
  status: MaintenanceStatus;
  assignedTo?: string;
  notes?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Depreciation {
  assetId: string;
  assetName: string;
  purchasePrice: number;
  purchaseDate: string;
  usefulLife: number; // 내용연수 (년)
  salvageValue: number; // 잔존가치
  method: 'straight-line' | 'declining-balance'; // 정액법 | 정률법
  currentValue: number; // 현재가치
  accumulatedDepreciation: number; // 감가상각누계액
  yearlyDepreciation: number[]; // 연도별 감가상각비
}

// 알림 타입
export type NotificationType = 'maintenance' | 'rental' | 'overdue' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  assetId?: string;
  maintenanceScheduleId?: string;
  link?: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}
