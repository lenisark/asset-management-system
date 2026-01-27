import type { Asset, Transaction, MaintenanceSchedule } from './types';
import { supabase, TABLES } from './supabaseClient';

// 파일명을 안전하게 sanitize하는 함수 (향후 사용 가능)
export const sanitizeFileName = (fileName: string): string => {
  // 파일명과 확장자 분리
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : 'jpg';
  const baseName = parts.join('.');
  
  // 한글, 공백, 특수문자를 언더스코어로 변경
  // 영문, 숫자, 하이픈, 언더스코어만 허용
  const safeName = baseName
    .replace(/[^\w\s-]/g, '_')  // 특수문자 → _
    .replace(/[\s]+/g, '_')      // 공백 → _
    .replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '_'); // 한글 → _
  
  // 연속된 언더스코어 제거
  const cleanName = safeName.replace(/_+/g, '_').replace(/^_|_$/g, '');
  
  return `${cleanName || 'image'}.${ext}`;
};

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

export const saveAsset = async (asset: Asset): Promise<{ success: boolean; error?: string }> => {
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
    
    // 에러 타입별로 사용자 친화적인 메시지 생성
    let errorMessage = '자산 저장에 실패했습니다.';
    
    if (result.error.code === '23505') {
      // Unique constraint violation (시리얼 번호 중복)
      errorMessage = '이미 등록된 시리얼 번호입니다. 다른 시리얼 번호를 사용해주세요.';
    } else if (result.error.code === '23503') {
      // Foreign key violation
      errorMessage = '참조 무결성 오류가 발생했습니다.';
    } else if (result.error.code === '23502') {
      // Not null violation (필수 필드 누락)
      const field = result.error.message.match(/column "(.+?)"/)?.[1];
      errorMessage = field 
        ? `필수 항목이 누락되었습니다: ${field}` 
        : '필수 항목을 모두 입력해주세요.';
    } else if (result.error.message.includes('timeout')) {
      errorMessage = '서버 응답 시간이 초과되었습니다. 다시 시도해주세요.';
    } else if (result.error.message.includes('network')) {
      errorMessage = '네트워크 연결을 확인해주세요.';
    } else if (result.error.message) {
      errorMessage = `저장 오류: ${result.error.message}`;
    }
    
    return { success: false, error: errorMessage };
  }
  
  return { success: true };
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
    // 허용된 이미지 확장자 목록
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    
    // 원본 파일명에서 확장자 추출
    const originalExt = file.name.split('.').pop()?.toLowerCase() || '';
    
    // 확장자가 허용된 것인지 확인, 아니면 MIME 타입에서 추출
    let fileExt = allowedExtensions.includes(originalExt) ? originalExt : null;
    
    // 확장자가 없으면 MIME 타입에서 추출
    if (!fileExt) {
      const mimeToExt: { [key: string]: string } = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/bmp': 'bmp',
        'image/svg+xml': 'svg'
      };
      fileExt = mimeToExt[file.type] || 'jpg';
    }
    
    // 안전한 파일명 생성: assetId-timestamp-random.확장자
    // 한글이나 특수문자 없이 영문, 숫자, 하이픈만 사용
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${assetId}-${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `assets/${fileName}`;

    console.log('Uploading file:', fileName, 'Type:', file.type);

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

// ===== Maintenance Schedules =====

// 유지보수 스케줄 목록 조회
export const getMaintenanceSchedules = async (): Promise<MaintenanceSchedule[]> => {
  const { data, error } = await supabase
    .from(TABLES.MAINTENANCE_SCHEDULES)
    .select('*')
    .order('scheduled_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching maintenance schedules:', error);
    return [];
  }
  
  return (data || []).map(item => ({
    id: item.id,
    assetId: item.asset_id,
    type: item.type,
    scheduledDate: item.scheduled_date,
    completedDate: item.completed_date,
    status: item.status,
    assignedTo: item.assigned_to,
    notes: item.notes,
    cost: item.cost,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

// 특정 자산의 유지보수 스케줄 조회
export const getMaintenanceSchedulesByAssetId = async (assetId: string): Promise<MaintenanceSchedule[]> => {
  const { data, error } = await supabase
    .from(TABLES.MAINTENANCE_SCHEDULES)
    .select('*')
    .eq('asset_id', assetId)
    .order('scheduled_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching maintenance schedules:', error);
    return [];
  }
  
  return (data || []).map(item => ({
    id: item.id,
    assetId: item.asset_id,
    type: item.type,
    scheduledDate: item.scheduled_date,
    completedDate: item.completed_date,
    status: item.status,
    assignedTo: item.assigned_to,
    notes: item.notes,
    cost: item.cost,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

// 유지보수 스케줄 저장 (생성/수정)
export const saveMaintenanceSchedule = async (schedule: MaintenanceSchedule): Promise<boolean> => {
  const { data: existingData } = await supabase
    .from(TABLES.MAINTENANCE_SCHEDULES)
    .select('id')
    .eq('id', schedule.id)
    .single();

  const dbRecord = {
    id: schedule.id,
    asset_id: schedule.assetId,
    type: schedule.type,
    scheduled_date: schedule.scheduledDate,
    completed_date: schedule.completedDate,
    status: schedule.status,
    assigned_to: schedule.assignedTo,
    notes: schedule.notes,
    cost: schedule.cost,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (existingData) {
    // 업데이트
    const result = await supabase
      .from(TABLES.MAINTENANCE_SCHEDULES)
      .update(dbRecord)
      .eq('id', schedule.id);
    error = result.error;
  } else {
    // 신규 생성
    const result = await supabase
      .from(TABLES.MAINTENANCE_SCHEDULES)
      .insert({
        ...dbRecord,
        created_at: new Date().toISOString(),
      });
    error = result.error;
  }
  
  if (error) {
    console.error('Error saving maintenance schedule:', error);
    return false;
  }
  
  return true;
};

// 유지보수 스케줄 삭제
export const deleteMaintenanceSchedule = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.MAINTENANCE_SCHEDULES)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting maintenance schedule:', error);
    return false;
  }
  
  return true;
};
