import { Asset, Transaction } from './types';
import { supabase, TABLES } from './supabaseClient';

// 자산 관리
export const getAssets = async (): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from(TABLES.ASSETS)
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
  
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    serialNumber: item.serial_number,
    manufacturer: item.manufacturer,
    purchaseDate: item.purchase_date,
    purchasePrice: item.purchase_price,
    status: item.status,
    location: item.location,
    notes: item.notes,
    imageUrl: item.image_url,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

export const saveAsset = async (asset: Asset): Promise<boolean> => {
  const dbAsset = {
    id: asset.id,
    name: asset.name,
    category: asset.category,
    serial_number: asset.serialNumber,
    manufacturer: asset.manufacturer,
    purchase_date: asset.purchaseDate,
    purchase_price: asset.purchasePrice,
    status: asset.status,
    location: asset.location,
    notes: asset.notes,
    image_url: asset.imageUrl,
    updated_at: new Date().toISOString(),
  };

  // Check if asset exists
  const { data: existing } = await supabase
    .from(TABLES.ASSETS)
    .select('id')
    .eq('id', asset.id)
    .single();

  let result;
  if (existing) {
    // Update existing
    result = await supabase
      .from(TABLES.ASSETS)
      .update(dbAsset)
      .eq('id', asset.id);
  } else {
    // Insert new
    result = await supabase
      .from(TABLES.ASSETS)
      .insert({ ...dbAsset, created_at: new Date().toISOString() });
  }

  if (result.error) {
    console.error('Error saving asset:', result.error);
    return false;
  }
  
  return true;
};

export const deleteAsset = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.ASSETS)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting asset:', error);
    return false;
  }
  
  return true;
};

export const getAssetById = async (id: string): Promise<Asset | undefined> => {
  const { data, error } = await supabase
    .from(TABLES.ASSETS)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) {
    console.error('Error fetching asset:', error);
    return undefined;
  }
  
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    serialNumber: data.serial_number,
    manufacturer: data.manufacturer,
    purchaseDate: data.purchase_date,
    purchasePrice: data.purchase_price,
    status: data.status,
    location: data.location,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// 거래 내역 관리
export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from(TABLES.TRANSACTIONS)
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  
  return (data || []).map(item => ({
    id: item.id,
    assetId: item.asset_id,
    type: item.type,
    employeeName: item.employee_name,
    department: item.department,
    date: item.date,
    notes: item.notes,
    createdAt: item.created_at,
  }));
};

export const saveTransaction = async (transaction: Transaction): Promise<boolean> => {
  const dbTransaction = {
    id: transaction.id,
    asset_id: transaction.assetId,
    type: transaction.type,
    employee_name: transaction.employeeName,
    department: transaction.department,
    date: transaction.date,
    notes: transaction.notes,
    created_at: transaction.createdAt,
  };

  const { error } = await supabase
    .from(TABLES.TRANSACTIONS)
    .insert(dbTransaction);
  
  if (error) {
    console.error('Error saving transaction:', error);
    return false;
  }
  
  return true;
};

export const getTransactionsByAssetId = async (assetId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from(TABLES.TRANSACTIONS)
    .select('*')
    .eq('asset_id', assetId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  
  return (data || []).map(item => ({
    id: item.id,
    assetId: item.asset_id,
    type: item.type,
    employeeName: item.employee_name,
    department: item.department,
    date: item.date,
    notes: item.notes,
    createdAt: item.created_at,
  }));
};

// 이미지 업로드
export const uploadAssetImage = async (file: File, assetId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${assetId}-${Date.now()}.${fileExt}`;
    const filePath = `assets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('asset-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // 공개 URL 가져오기
    const { data } = supabase.storage
      .from('asset-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// 이미지 삭제
export const deleteAssetImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // URL에서 파일 경로 추출
    const urlParts = imageUrl.split('/asset-images/');
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('asset-images')
      .remove([`assets/${filePath}`]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

// UUID 생성
export const generateId = (): string => {
  return crypto.randomUUID();
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
