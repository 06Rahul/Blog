import api from '../utils/api';

export const notificationService = {
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },

    getGroupedNotifications: async () => {
        const response = await api.get('/notifications/grouped');
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data.unreadCount ?? 0;
    },

    getPreferences: async () => {
        const response = await api.get('/notifications/preferences');
        return response.data;
    },

    updatePreferences: async (payload) => {
        const response = await api.put('/notifications/preferences', payload);
        return response.data;
    },

    markAsRead: async (id) => {
        await api.put(`/notifications/${id}/read`);
    },

    markAllAsRead: async () => {
        await api.put('/notifications/read-all');
    },

    dismiss: async (id) => {
        await api.delete(`/notifications/${id}`);
    }
};
