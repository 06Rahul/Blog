import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { webSocketService } from '../services/messagingService';

const NotificationContext = createContext(null);

const normalizeNotification = (notification) => {
  const type = String(notification?.type || 'comment').toLowerCase();
  const senderName = notification?.sender?.displayName || notification?.sender?.username || notification?.actor || 'System';
  return {
    id: notification?.id,
    type,
    title: notification?.title || `${senderName} sent an update`,
    message: notification?.message || '',
    actor: senderName,
    createdAt: notification?.createdAt || new Date().toISOString(),
    read: Boolean(notification?.read),
    routeUrl: notification?.routeUrl || '/notifications',
    sender: notification?.sender || null,
    referenceId: notification?.referenceId || null,
  };
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [items, unread] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount().catch(() => null),
      ]);
      const normalized = (Array.isArray(items) ? items : []).map(normalizeNotification);
      setNotifications(normalized);
      setUnreadCount(typeof unread === 'number' ? unread : normalized.filter((item) => !item.read).length);
    } catch (err) {
      console.error('Failed to refresh notifications', err);
      setNotifications([]);
      setUnreadCount(0);
      setError('Notifications are unavailable right now.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!isAuthenticated || !user) return undefined;

    let subscriptions = [];
    const connect = async () => {
      try {
        if (!webSocketService.isConnected) {
          await webSocketService.connect();
        }
        if (webSocketService.client?.connected) {
          subscriptions = webSocketService.subscribeToNotifications(
            (incoming) => {
              const normalized = normalizeNotification(incoming);
              setNotifications((current) => [normalized, ...current.filter((item) => item.id !== normalized.id)]);
              setUnreadCount((count) => count + (normalized.read ? 0 : 1));
              toast.success(normalized.title);
            },
            (countPayload) => setUnreadCount(Number(countPayload?.unreadCount ?? countPayload ?? 0))
          );
        }
      } catch (err) {
        console.error('Failed to subscribe to notifications', err);
      }
    };

    connect();
    return () => subscriptions.forEach((subscription) => subscription?.unsubscribe?.());
  }, [isAuthenticated, user]);

  const markAsRead = useCallback(async (id) => {
    const target = notifications.find((item) => item.id === id);
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
    if (target && !target.read) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      refreshNotifications();
    }
  }, [notifications, refreshNotifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
      refreshNotifications();
    }
  }, [refreshNotifications]);

  const dismissNotification = useCallback((id) => {
    const target = notifications.find((item) => item.id === id);
    setNotifications((current) => current.filter((item) => item.id !== id));
    if (target && !target.read) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }
  }, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  }), [notifications, unreadCount, loading, error, refreshNotifications, markAsRead, markAllAsRead, dismissNotification]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
