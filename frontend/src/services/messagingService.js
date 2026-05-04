import api from '../utils/api';

let SockJS;
let Stomp;
let webSocketEnabled = true;

const loadWebSocketLibraries = async () => {
  if (!SockJS || !Stomp) {
    try {
      const sockjsModule = await import('sockjs-client');
      SockJS = sockjsModule.default || sockjsModule;

      const stompModule = await import('stompjs');
      Stomp = stompModule.default || stompModule;
    } catch (error) {
      console.error('Failed to load WebSocket libraries:', error);
      webSocketEnabled = false;
    }
  }
};

export const conversationService = {
  getConversations: async (page = 0, size = 20) => {
    const response = await api.get('/conversations', { params: { page, size } });
    return response.data;
  },

  getActiveConversations: async (page = 0, size = 20) => {
    const response = await api.get('/conversations/active', { params: { page, size } });
    return response.data;
  },

  getConversation: async (conversationId) => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  },

  getOrCreateConversation: async (userId) => {
    const response = await api.post(`/conversations/with/${userId}`);
    return response.data;
  },

  deleteConversation: async (conversationId) => {
    await api.delete(`/conversations/${conversationId}`);
  }
};

export const messageService = {
  sendMessage: async (conversationId, content, mediaUrl = null, messageType = 'TEXT') => {
    const response = await api.post(`/messages/conversation/${conversationId}`, {
      content,
      mediaUrl,
      messageType
    });
    return response.data;
  },

  getMessages: async (conversationId, page = 0, size = 50) => {
    const response = await api.get(`/messages/conversation/${conversationId}`, {
      params: { page, size }
    });
    return response.data;
  },

  markAsRead: async (messageId) => {
    await api.put(`/messages/${messageId}/read`);
  },

  markAsDelivered: async (messageId) => {
    await api.put(`/messages/${messageId}/delivered`);
  },

  markConversationAsRead: async (conversationId) => {
    await api.put(`/messages/conversation/${conversationId}/read-all`);
  },

  getUnreadCount: async (conversationId) => {
    const response = await api.get(`/messages/conversation/${conversationId}/unread-count`);
    return response.data.unreadCount;
  },

  getTotalUnreadMessages: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data.totalUnread;
  },

  deleteMessage: async (messageId) => {
    await api.delete(`/messages/${messageId}`);
  }
};

export const followService = {
  getFollowers: async () => {
    try {
      const response = await api.get('/follows/followers');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get followers:', error);
      return [];
    }
  },

  getFollowing: async () => {
    try {
      const response = await api.get('/follows/following');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get following:', error);
      return [];
    }
  }
};

export const webSocketService = {
  client: null,
  subscriptions: {},
  isConnected: false,

  connect: () => new Promise(async (resolve) => {
    try {
      await loadWebSocketLibraries();
      if (!webSocketEnabled || !SockJS || !Stomp) {
        webSocketService.isConnected = false;
        resolve(null);
        return;
      }

      if (webSocketService.client?.connected) {
        resolve(webSocketService.client);
        return;
      }

      const socket = new SockJS('/ws/chat');
      const client = Stomp.over(socket);
      client.connect(
        {},
        () => {
          webSocketService.client = client;
          webSocketService.isConnected = true;
          resolve(client);
        },
        (error) => {
          console.error('WebSocket connection error:', error);
          webSocketService.isConnected = false;
          resolve(null);
        }
      );
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      webSocketService.isConnected = false;
      resolve(null);
    }
  }),

  disconnect: () => {
    if (webSocketService.client) {
      webSocketService.client.disconnect(() => {
        webSocketService.client = null;
        webSocketService.subscriptions = {};
      });
    }
  },

  subscribeToConversation: (conversationId, onMessageReceived) => {
    return webSocketService.subscribe(`conversation-${conversationId}`, `/topic/conversation/${conversationId}`, onMessageReceived);
  },

  subscribeToTypingIndicator: (conversationId, onTypingChange) => {
    return webSocketService.subscribe(`typing-${conversationId}`, `/topic/typing/${conversationId}`, onTypingChange);
  },

  subscribeToMessageStatus: (conversationId, onStatusChange) => {
    return webSocketService.subscribe(`status-${conversationId}`, `/topic/conversation/${conversationId}/status`, onStatusChange);
  },

  subscribeToPresence: (userId, onPresenceChange) => {
    return webSocketService.subscribe(`presence-${userId}`, `/topic/presence/${userId}`, onPresenceChange);
  },

  subscribeToNotifications: (onNotification, onUnreadCountChange) => {
    const notificationSub = webSocketService.subscribe('notifications', '/user/queue/notifications', onNotification);
    const countSub = webSocketService.subscribe('notification-count', '/user/queue/notification-count', onUnreadCountChange);
    return [notificationSub, countSub].filter(Boolean);
  },

  subscribeToUnreadMessages: (onUnreadCountChange) => {
    return webSocketService.subscribe('message-unread-count', '/user/queue/messages/unread-count', onUnreadCountChange);
  },

  subscribe: (key, destination, handler) => {
    if (!webSocketService.client) {
      return null;
    }

    const subscription = webSocketService.client.subscribe(destination, (message) => {
      handler(JSON.parse(message.body));
    });
    webSocketService.subscriptions[key] = subscription;
    return subscription;
  },

  sendMessage: (conversationId, messageRequest) => {
    if (!webSocketService.client) return;
    webSocketService.client.send(`/app/chat/${conversationId}`, {}, JSON.stringify(messageRequest));
  },

  notifyTyping: (conversationId, userId) => {
    if (!webSocketService.client) return;
    webSocketService.client.send(`/app/typing/${conversationId}/${userId}`, {});
  },

  notifyStopTyping: (conversationId, userId) => {
    if (!webSocketService.client) return;
    webSocketService.client.send(`/app/stop-typing/${conversationId}/${userId}`, {});
  },

  markPresenceOnline: (userId) => {
    if (!webSocketService.client || !userId) return;
    webSocketService.client.send(`/app/presence/online/${userId}`, {});
  },

  markPresenceOffline: (userId) => {
    if (!webSocketService.client || !userId) return;
    webSocketService.client.send(`/app/presence/offline/${userId}`, {});
  },

  heartbeatPresence: (userId) => {
    if (!webSocketService.client || !userId) return;
    webSocketService.client.send(`/app/presence/heartbeat/${userId}`, {});
  },

  unsubscribeFromConversation: (conversationId) => {
    webSocketService.unsubscribe(`conversation-${conversationId}`);
  },

  unsubscribeFromTypingIndicator: (conversationId) => {
    webSocketService.unsubscribe(`typing-${conversationId}`);
  },

  unsubscribeFromMessageStatus: (conversationId) => {
    webSocketService.unsubscribe(`status-${conversationId}`);
  },

  unsubscribeFromPresence: (userId) => {
    webSocketService.unsubscribe(`presence-${userId}`);
  },

  unsubscribe: (key) => {
    if (webSocketService.subscriptions[key]) {
      webSocketService.subscriptions[key].unsubscribe();
      delete webSocketService.subscriptions[key];
    }
  }
};
