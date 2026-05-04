import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read && notification.id) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
    navigate(notification.routeUrl || '/notifications');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen((open) => !open)} className="relative rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300 hover:bg-white/10 hover:text-white">
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[22rem] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-cyan-200 hover:text-cyan-100">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-3">
            {notifications.length === 0 ? (
              <div className="rounded-[20px] bg-white/5 p-4 text-center text-sm text-slate-400">No notifications</div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 6).map((notification) => (
                  <button
                    key={notification.id || `${notification.createdAt}-${notification.message}`}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full rounded-[22px] border p-4 text-left transition ${notification.read ? 'border-white/5 bg-white/5' : 'border-cyan-400/20 bg-cyan-400/10'}`}
                  >
                    <p className="text-sm font-medium text-white">{notification.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{notification.message}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Recently'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
