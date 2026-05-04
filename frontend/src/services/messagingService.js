import api from '../utils/api';

// Lazy load WebSocket libraries
let SockJS, Stomp;
let webSocketEnabled = true;

const loadWebSocketLibraries = async () => {
  if (!SockJS || !Stomp) {
    try {
      // Try to load sockjs-client
      const sockjsModule = await import('sockjs-client');
      SockJS = sockjsModule.default || sockjsModule;

      // Try to load stompjs
      const stompModule = await import('stompjs');
      Stomp = stompModule.default || stompModule;

      console.log('WebSocket libraries loaded successfully');
    } catch (error) {
      console.error('Failed to load WebSocket libraries:', error);
      console.warn('WebSocket will be disabled. Messages will still work via REST API.');
      webSocketEnabled = false;
      // Don't throw - allow REST API messaging to work
    }
  }
};

export const conversationService = {
  // Get all conversations for current user
  getConversations: async (page = 0, size = 20) => {
    const response = await api.get('/conversations', {
      params: { page, size }
    });
    return response.data;
  },

  // Get active conversations only
  getActiveConversations: async (page = 0, size = 20) => {
    const response = await api.get('/conversations/active', {
      params: { page, size }
    });
    return response.data;
  },

  // Get conversation details
  getConversation: async (conversationId) => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  },

  // Get or create conversation with a user
  getOrCreateConversation: async (userId) => {
    const response = await api.post(`/conversations/with/${userId}`);
    return response.data;
  },

  // Delete/Archive a conversation
  deleteConversation: async (conversationId) => {
    await api.delete(`/conversations/${conversationId}`);
  }
};

export const messageService = {
  // Send a message
  sendMessage: async (conversationId, content, mediaUrl = null, messageType = 'TEXT') => {
    const response = await api.post(`/messages/conversation/${conversationId}`, {
      content,
      mediaUrl,
      messageType
    });
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId, page = 0, size = 50) => {
    const response = await api.get(`/messages/conversation/${conversationId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Mark a message as read
  markAsRead: async (messageId) => {
    await api.put(`/messages/${messageId}/read`);
  },

  // Mark all messages in conversation as read
  markConversationAsRead: async (conversationId) => {
    await api.put(`/messages/conversation/${conversationId}/read-all`);
  },

  // Get unread count for conversation
  getUnreadCount: async (conversationId) => {
    const response = await api.get(`/messages/conversation/${conversationId}/unread-count`);
    return response.data.unreadCount;
  },

  // Get total unread messages for current user
  getTotalUnreadMessages: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data.totalUnread;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    await api.delete(`/messages/${messageId}`);
  }
};

// Follow service for getting followers and following
export const followService = {
  // Get followers for current user
  getFollowers: async () => {
    try {
      const response = await api.get('/follows/followers');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get followers:', error);
      return [];
    }
  },

  // Get following for current user
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

// WebSocket service for real-time messaging
export const webSocketService = {
  client: null,
  subscriptions: {},
  isConnected: false,

  connect: () => {
    return new Promise(async (resolve, reject) => {
      try {
        await loadWebSocketLibraries();

        // If WebSocket is disabled, resolve without connecting
        if (!webSocketEnabled || !SockJS || !Stomp) {
          console.warn('WebSocket not available, using REST API polling instead');
          webSocketService.isConnected = false;
          resolve(null);
          return;
        }

        const socket = new SockJS('http://localhost:8080/ws/chat');
        const client = Stomp.over(socket);

        client.connect({},
          () => {
            webSocketService.client = client;
            webSocketService.isConnected = true;
            console.log('WebSocket connected');
            resolve(client);
          },
          (error) => {
            console.error('WebSocket connection error:', error);
            webSocketService.isConnected = false;
            // Resolve instead of reject to allow app to work without WebSocket
            resolve(null);
          }
        );
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        webSocketService.isConnected = false;
        resolve(null); // Allow app to work without WebSocket
      }
    });
  },

  disconnect: () => {
    if (webSocketService.client) {
      webSocketService.client.disconnect(() => {
        webSocketService.client = null;
        webSocketService.subscriptions = {};
      });
    }
  },

  subscribeToConversation: (conversationId, onMessageReceived) => {
    if (!webSocketService.client) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscriptionKey = `conversation-${conversationId}`;

    const subscription = webSocketService.client.subscribe(
      `/topic/conversation/${conversationId}`,
      (message) => {
        const messageData = JSON.parse(message.body);
        onMessageReceived(messageData);
      }
    );

    webSocketService.subscriptions[subscriptionKey] = subscription;
    return subscription;
  },

  subscribeToTypingIndicator: (conversationId, onTypingChange) => {
    if (!webSocketService.client) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscriptionKey = `typing-${conversationId}`;

    const subscription = webSocketService.client.subscribe(
      `/topic/typing/${conversationId}`,
      (message) => {
        const typingData = JSON.parse(message.body);
        onTypingChange(typingData);
      }
    );

    webSocketService.subscriptions[subscriptionKey] = subscription;
    return subscription;
  },

  sendMessage: (conversationId, messageRequest) => {
    if (!webSocketService.client) {
      console.error('WebSocket not connected');
      return;
    }

    webSocketService.client.send(
      `/app/chat/${conversationId}`,
      {},
      JSON.stringify(messageRequest)
    );
  },

  notifyTyping: (conversationId, userId) => {
    if (!webSocketService.client) {
      console.error('WebSocket not connected');
      return;
    }

    webSocketService.client.send(
      `/app/typing/${conversationId}/${userId}`,
      {}
    );
  },

  notifyStopTyping: (conversationId, userId) => {
    if (!webSocketService.client) {
      console.error('WebSocket not connected');
      return;
    }

    webSocketService.client.send(
      `/app/stop-typing/${conversationId}/${userId}`,
      {}
    );
  },

  unsubscribeFromConversation: (conversationId) => {
    const subscriptionKey = `conversation-${conversationId}`;
    if (webSocketService.subscriptions[subscriptionKey]) {
      webSocketService.subscriptions[subscriptionKey].unsubscribe();
      delete webSocketService.subscriptions[subscriptionKey];
    }
  },

  unsubscribeFromTypingIndicator: (conversationId) => {
    const subscriptionKey = `typing-${conversationId}`;
    if (webSocketService.subscriptions[subscriptionKey]) {
      webSocketService.subscriptions[subscriptionKey].unsubscribe();
      delete webSocketService.subscriptions[subscriptionKey];
    }
  }
};
