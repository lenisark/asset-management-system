-- Supabase 자산관리 시스템 데이터베이스 스키마

-- 자산 테이블
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('PC', 'Monitor', 'Keyboard', 'Mouse', 'Other')),
  serial_number TEXT NOT NULL UNIQUE,
  manufacturer TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'in-use', 'maintenance', 'disposed')),
  location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 거래 내역 테이블
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('checkout', 'checkin')),
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_serial_number ON assets(serial_number);
CREATE INDEX IF NOT EXISTS idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- RLS (Row Level Security) 활성화
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users" ON assets
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON transactions
  FOR SELECT USING (true);

-- 모든 사용자가 삽입 가능
CREATE POLICY "Enable insert for all users" ON assets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON transactions
  FOR INSERT WITH CHECK (true);

-- 모든 사용자가 업데이트 가능
CREATE POLICY "Enable update for all users" ON assets
  FOR UPDATE USING (true);

-- 모든 사용자가 삭제 가능
CREATE POLICY "Enable delete for all users" ON assets
  FOR DELETE USING (true);

-- 자동 업데이트 시간 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입 (선택사항)
-- INSERT INTO assets (id, name, category, serial_number, manufacturer, purchase_date, purchase_price, status, location, notes)
-- VALUES 
--   (gen_random_uuid(), 'Dell OptiPlex 7090', 'PC', 'SN-PC-001', 'Dell', '2024-01-15', 1500000, 'available', '본사 3층 개발팀', '고성능 워크스테이션'),
--   (gen_random_uuid(), 'LG 27인치 모니터', 'Monitor', 'SN-MON-001', 'LG', '2024-01-20', 350000, 'in-use', '본사 2층 디자인팀', 'QHD 해상도'),
--   (gen_random_uuid(), 'MacBook Pro 16', 'PC', 'SN-PC-002', 'Apple', '2024-02-01', 3500000, 'in-use', '본사 4층 경영지원팀', 'M2 Max 프로세서');
