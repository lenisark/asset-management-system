import { useState, useRef, useEffect } from 'react';
import { Bell, X, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../utils';

export const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 알림 타입별 아이콘 색상
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'text-orange-500';
      case 'rental':
        return 'text-blue-500';
      case 'overdue':
        return 'text-red-500';
      case 'system':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  // 알림 타입 한글 변환
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'maintenance':
        return '유지보수';
      case 'rental':
        return '대여';
      case 'overdue':
        return '연체';
      case 'system':
        return '시스템';
      default:
        return '알림';
    }
  };

  // 알림 클릭 처리
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // 링크가 있으면 이동 (추후 구현)
    if (notification.link) {
      // window.location.href = notification.link;
      console.log('Navigate to:', notification.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 벨 아이콘 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        aria-label="알림"
      >
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">알림</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {unreadCount}개의 읽지 않은 알림
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="모두 읽음"
                    >
                      <CheckCheck className="w-4 h-4 text-blue-500" />
                    </button>
                  )}
                  <button
                    onClick={deleteAllNotifications}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="모두 삭제"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">로딩 중...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">알림이 없습니다</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* 타입 표시 */}
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${getTypeColor(notification.type)} mt-1.5`}></div>
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-semibold ${
                          !notification.read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="삭제"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                        <span className={`${getTypeColor(notification.type)}`}>
                          {getTypeLabel(notification.type)}
                        </span>
                        <span>•</span>
                        <span>{formatDate(notification.createdAt)}</span>
                        {!notification.read && (
                          <>
                            <span>•</span>
                            <span className="text-blue-500 font-semibold">읽지 않음</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 푸터 */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // 알림 전체 페이지로 이동 (추후 구현)
                  console.log('Navigate to notifications page');
                }}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                모든 알림 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
