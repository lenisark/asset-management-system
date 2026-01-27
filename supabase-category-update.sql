-- 자산 카테고리 확장
-- 기존: PC, Monitor, Keyboard, Mouse, Other
-- 추가: Printer, Laptop, Tablet, Phone, Cable

-- 1. CHECK 제약 조건 삭제
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_category_check;

-- 2. 새로운 CHECK 제약 조건 추가 (확장된 카테고리)
ALTER TABLE assets 
  ADD CONSTRAINT assets_category_check 
  CHECK (category IN ('PC', 'Monitor', 'Keyboard', 'Mouse', 'Printer', 'Laptop', 'Tablet', 'Phone', 'Cable', 'Other'));

-- 확인용 쿼리 (선택사항)
-- SELECT constraint_name, check_clause 
-- FROM information_schema.check_constraints 
-- WHERE constraint_name = 'assets_category_check';
