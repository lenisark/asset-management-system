-- Supabase 자산관리 시스템 - 업데이트 스크립트
-- 기존 스키마가 있는 경우 이 스크립트를 사용하세요

-- 1. image_url 컬럼 추가 (없는 경우에만)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE assets ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- 2. 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON assets;
DROP POLICY IF EXISTS "Enable read access for all users" ON transactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON assets;
DROP POLICY IF EXISTS "Enable insert for all users" ON transactions;
DROP POLICY IF EXISTS "Enable update for all users" ON assets;
DROP POLICY IF EXISTS "Enable delete for all users" ON assets;

-- 3. RLS 활성화
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 4. 새로운 RLS 정책 생성
CREATE POLICY "Enable read access for all users" ON assets
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON assets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON assets
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON assets
  FOR DELETE USING (true);

-- 5. 트리거 재생성 (기존 트리거 교체)
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 업데이트 완료! image_url 컬럼과 정책이 추가되었습니다.';
END $$;
