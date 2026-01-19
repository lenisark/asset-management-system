-- ====================================
-- Notifications System
-- 알림 시스템 데이터베이스 스키마
-- ====================================

-- notifications 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'maintenance', 'rental', 'overdue', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  maintenance_schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  link TEXT, -- 클릭 시 이동할 링크
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS (Row Level Security) 활성화
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- 정책 생성
-- 사용자는 자신의 알림만 조회 가능
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- 사용자는 자신의 알림만 업데이트 가능 (읽음 처리)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 인증된 사용자는 알림 생성 가능 (시스템용)
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 사용자는 자신의 알림 삭제 가능
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- ====================================
-- 유틸리티 함수
-- ====================================

-- 읽지 않은 알림 수를 반환하는 함수
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = p_user_id
    AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 오래된 알림 자동 삭제 함수 (30일 이상)
CREATE OR REPLACE FUNCTION delete_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- 샘플 데이터 (테스트용)
-- ====================================

-- 현재 로그인한 사용자에게 테스트 알림 생성 (선택사항)
-- INSERT INTO notifications (user_id, type, title, message)
-- VALUES (
--   auth.uid(),
--   'system',
--   '환영합니다!',
--   '알림 시스템이 성공적으로 설정되었습니다.'
-- );

-- ====================================
-- 확인 쿼리
-- ====================================

-- 테이블 생성 확인
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- 인덱스 확인
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'notifications';

-- 정책 확인
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'notifications';
