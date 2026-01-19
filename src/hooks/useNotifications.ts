import { useEffect, useState, useCallback } from 'react';
import type { Notification } from '../types';
import { supabase } from '../supabaseClient';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 알림 목록 로드
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // 최근 50개만

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      const mappedData: Notification[] = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        title: item.title,
        message: item.message,
        assetId: item.asset_id,
        maintenanceScheduleId: item.maintenance_schedule_id,
        link: item.link,
        read: item.read,
        createdAt: item.created_at,
        readAt: item.read_at,
      }));

      setNotifications(mappedData);
      setUnreadCount(mappedData.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 알림 읽음 처리
  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  // 알림 삭제
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      const wasUnread = notifications.find(n => n.id === id)?.read === false;
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // 모든 알림 삭제
  const deleteAllNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting all notifications:', error);
        return;
      }

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }, []);

  // 알림 생성 (테스트용)
  const createNotification = useCallback(async (
    type: Notification['type'],
    title: string,
    message: string,
    options?: {
      assetId?: string;
      maintenanceScheduleId?: string;
      link?: string;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type,
          title,
          message,
          asset_id: options?.assetId,
          maintenance_schedule_id: options?.maintenanceScheduleId,
          link: options?.link,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return;
      }

      // 새 알림을 목록 맨 앞에 추가
      const newNotif: Notification = {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        assetId: data.asset_id,
        maintenanceScheduleId: data.maintenance_schedule_id,
        link: data.link,
        read: data.read,
        createdAt: data.created_at,
        readAt: data.read_at,
      };

      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, []);

  // 초기 로드 및 실시간 구독
  useEffect(() => {
    loadNotifications();

    // 실시간 구독 설정
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;

      channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${data.user.id}`,
          },
          (payload) => {
            console.log('New notification:', payload);
            const newNotif: Notification = {
              id: payload.new.id,
              userId: payload.new.user_id,
              type: payload.new.type,
              title: payload.new.title,
              message: payload.new.message,
              assetId: payload.new.asset_id,
              maintenanceScheduleId: payload.new.maintenance_schedule_id,
              link: payload.new.link,
              read: payload.new.read,
              createdAt: payload.new.created_at,
              readAt: payload.new.read_at,
            };

            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification,
    refresh: loadNotifications,
  };
};
