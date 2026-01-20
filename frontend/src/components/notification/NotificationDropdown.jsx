import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { webSocketService } from '../../services/messagingService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Initial load
    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user]);

    // WebSocket Subscription
    useEffect(() => {
        if (!user) return;

        const setupWebSocket = async () => {
            try {
                if (!webSocketService.isConnected) {
                    await webSocketService.connect();
                }

                // Subscribe to notifications queue
                // Assuming webSocketService exposes the client or a generic subscribe method
                // If not, we might need to extend messagingService.js, but let's try assuming standard stomp pattern
                // Logic adapted from ChatWindow.jsx
                if (webSocketService.client && webSocketService.client.connected) {
                    webSocketService.client.subscribe(`/user/${user.id}/queue/notifications`, (message) => {
                        const notification = JSON.parse(message.body);
                        handleNewNotification(notification);
                    });
                }
            } catch (err) {
                console.error("Failed to subscribe to notifications", err);
            }
        };

        setupWebSocket();

        // Fallback polling (every 60s instead of 30, since we have WS)
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast
        toast((t) => (
            <div onClick={() => {
                handleNotificationClick(notification);
                toast.dismiss(t.id);
            }} className="cursor-pointer">
                <p className="font-semibold text-sm">New Notification</p>
                <p className="text-xs">{notification.message}</p>
            </div>
        ), {
            icon: '🔔',
            duration: 5000,
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await notificationService.markAsRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                );
            }

            setIsOpen(false);

            if (notification.type === 'NEW_POST') {
                navigate(`/blogs/${notification.referenceId}`);
            } else if (notification.type === 'FOLLOW') {
                navigate(`/profile/${notification.sender.username}`);
            }
        } catch (error) {
            console.error('Failed to handle notification click', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            {notification.sender.profileImageUrl ? (
                                                <img src={notification.sender.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                                                    {notification.sender.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                                <span className="font-semibold">{notification.sender.username}</span>
                                                {' '}{notification.message.replace(notification.sender.username, '').replace(notification.sender.firstName, '')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="flex-shrink-0 self-center">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
