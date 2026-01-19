-- 기존 데이터베이스에 유지보수 스케줄 기능 추가하기
-- 이미 자산관리 시스템을 사용 중인 경우 이 스크립트를 실행하세요

-- 유지보수 스케줄 테이블 생성
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('inspection', 'repair', 'cleaning', 'upgrade', 'other')),
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  assigned_to TEXT,
  notes TEXT,
  cost NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_maintenance_asset_id ON maintenance_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled_date ON maintenance_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_schedules(status);

-- RLS (Row Level Security) 활성화
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Enable read access for all users" ON maintenance_schedules;
DROP POLICY IF EXISTS "Enable insert for all users" ON maintenance_schedules;
DROP POLICY IF EXISTS "Enable update for all users" ON maintenance_schedules;
DROP POLICY IF EXISTS "Enable delete for all users" ON maintenance_schedules;

-- 읽기/쓰기/수정/삭제 정책 생성
CREATE POLICY "Enable read access for all users" ON maintenance_schedules
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON maintenance_schedules
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON maintenance_schedules
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON maintenance_schedules
  FOR DELETE USING (true);

-- 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_maintenance_updated_at ON maintenance_schedules;
CREATE TRIGGER update_maintenance_updated_at
  BEFORE UPDATE ON maintenance_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 완료! 이제 유지보수 스케줄 기능을 사용할 수 있습니다.
