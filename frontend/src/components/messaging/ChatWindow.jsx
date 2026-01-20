import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messageService, webSocketService, conversationService } from '../../services/messagingService';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const ChatWindow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState({});
  const [currentTypingTimeout, setCurrentTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () => messageService.getMessages(conversationId, page, 50),
    staleTime: 0,
    enabled: !!conversationId
  });

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => conversationService.getConversation(conversationId),
    enabled: !!conversationId
  });

  // Setup WebSocket connection
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        await webSocketService.connect();

        // Subscribe to messages
        webSocketService.subscribeToConversation(conversationId, (message) => {
          setMessages((prev) => [...prev, message]);
          queryClient.invalidateQueries(['messages', conversationId]);

          if (message.senderId !== user?.id) {
            toast('New message from ' + message.senderUsername, {
              icon: '💬',
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            });
            // Mark as read immediately if chat is open
            messageService.markConversationAsRead(conversationId);
          }
          scrollToBottom();
        });

        // Subscribe to typing indicator
        webSocketService.subscribeToTypingIndicator(conversationId, (typingData) => {
          if (typingData.userId !== user?.id) {
            if (typingData.isTyping) {
              setIsTyping((prev) => ({ ...prev, [typingData.userId]: true }));
            } else {
              setIsTyping((prev) => {
                const newState = { ...prev };
                delete newState[typingData.userId];
                return newState;
              });
            }
          }
        });

        // Mark conversation as read
        await messageService.markConversationAsRead(conversationId);
      } catch (err) {
        console.error('WebSocket connection failed:', err);
        toast.error('Real-time messaging unavailable');
      }
    };

    setupWebSocket();

    return () => {
      webSocketService.unsubscribeFromConversation(conversationId);
      webSocketService.unsubscribeFromTypingIndicator(conversationId);
    };
  }, [conversationId, user?.id, queryClient]);

  // Load messages from API
  useEffect(() => {
    if (messagesData?.content) {
      if (page === 0) {
        setMessages(messagesData.content);
      } else {
        setMessages((prev) => [...messagesData.content, ...prev]);
      }
      setHasMore(!messagesData.last);
      scrollToBottom();
    }
  }, [messagesData, page]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const input = e.target.elements.messageInput;
    const content = input.value.trim();

    if (!content) return;

    try {
      // Stop typing indicator
      webSocketService.notifyStopTyping(conversationId, user.id);

      // Optimistic update
      const tempId = Date.now().toString(); // Temporary ID for immediate display
      const newMessage = {
        id: tempId,
        conversationId,
        senderId: user.id,
        senderUsername: user.username,
        content,
        createdAt: new Date().toISOString(),
        isRead: false,
        messageType: 'TEXT',
        status: 'sending' // Custom status for UI
      };

      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
      input.value = '';
      input.focus();

      // Send via WebSocket (or API if WS fails, but here we assume WS service handles it)
      // Actually messagingService.js uses API for sending to ensure persistence
      const sentMessage = await messageService.sendMessage(conversationId, content);

      // Replace optimistic message with actual message
      setMessages((prev) => prev.map(m => m.id === tempId ? sentMessage : m));

    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter(m => m.status !== 'sending'));
    }
  };

  const handleTyping = () => {
    webSocketService.notifyTyping(conversationId, user.id);

    // Clear previous timeout
    if (currentTypingTimeout) {
      clearTimeout(currentTypingTimeout);
    }

    // Set new timeout to notify stop typing after 3 seconds of no activity
    const timeout = setTimeout(() => {
      webSocketService.notifyStopTyping(conversationId, user.id);
    }, 3000);

    setCurrentTypingTimeout(timeout);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messageService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5] dark:bg-[#0b141a]"> {/* WhatsApp-like background color */}
      {/* Header */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10 w-full sticky top-0">
        <button
          onClick={() => navigate('/messages')}
          className="text-[#54656f] dark:text-[#aebac1] hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {conversation && (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${conversation.otherUserUsername}`)}>
            <img
              src={getImageUrl(conversation.otherUserProfileImage)}
              alt={conversation.otherUserUsername}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">{conversation.otherUserUsername}</span>
              {Object.keys(isTyping).includes(conversation.otherUserId) ? (
                <span className="text-green-500 text-xs font-medium">typing...</span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 text-xs">click to view profile</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" // Optional seamless pattern, falls back to color
        style={{ backgroundColor: 'transparent' }}
      >
        {hasMore && messages.length > 0 && (
          <div className="text-center py-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-4 py-1 bg-white dark:bg-gray-800 rounded-full shadow-md text-xs text-blue-500 hover:text-blue-600 disabled:text-gray-400 transition-all"
            >
              Load more messages
            </button>
          </div>
        )}

        {messages.map((message, index) => {
          const isMe = message.senderId === user?.id;
          return (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`relative max-w-[85%] lg:max-w-[65%] px-2 py-1 rounded-lg shadow-sm text-sm flex flex-col ${isMe
                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-white rounded-tr-none'
                    : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-white rounded-tl-none'
                  }`}
                style={{
                  boxShadow: '0 1px 0.5px rgba(11,20,26,.13)'
                }}
              >
                {/* Sender Name in Group Chat context - though assume 1-on-1 for now based on UI */}
                {!isMe && (
                  // Optional: If you want to show name even in 1-on-1, but WhatsApp doesn't usuall do this for DM
                  // For now, let's skip unless it's a group, but user requested "whatsapp-like"
                  null
                )}

                {/* Message Content */}
                <div className="flex flex-wrap items-end gap-x-2">
                  <p className="break-words whitespace-pre-wrap leading-relaxed text-[15px] pb-1 px-1">{message.content}</p>

                  {/* Timestamp & Status - Floated to right bottom */}
                  <div className="flex items-center gap-1 ml-auto h-4 shrink-0 pb-1">
                    <span className={`text-[11px] min-w-fit ${isMe ? 'text-gray-500 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                    {isMe && (
                      <span className="ml-0.5 flex items-center">
                        {message.isRead ? (
                          // Double Blue Tick
                          <svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" className="" version="1.1" x="0px" y="0px" enableBackground="new 0 0 16 11">
                            <path fill="#53bdeb" d="M11.056073,1.353051 c0.122692-0.231268,0.34752-0.349148,0.59074-0.349148h0.222712l0.05739-0.106202c0.052864-0.103006,0.126584-0.1983,0.315052-0.1983 h0.323568c0.07684,0,0.18378,0.012586,0.24584,0.117188l0.04632,0.093416c0.04832,0.082728,0.08051,0.180426,0.1472,0.3013 l3.9482,8.887258c0.12075,0.221782-0.03847,0.490794-0.42866,0.490794l-0.297406-0.01099 c-0.188382,0.01099-0.435794-0.136862-0.54848-0.349148l-0.369806-0.783186c-0.128766,0.01099-0.279266,0.033568-0.457816,0.033568 c-0.635836,0-1.127814-0.267322-1.558364-0.6728c-0.08332-0.08862-0.08332-0.241582,0-0.320498l0.199042-0.193202 c0.04453-0.040108,0.16599-0.040108,0.21051,0 l0.0824,0.07348c0.16362,0.141558,0.3708,0.222712,0.59074,0.222712c0.08657,0,0.15085-0.01099,0.21441-0.024254l-1.63753-3.00397 c-0.0493-0.110292-0.1052-0.162744-0.231268-0.162744h-0.27732c-0.198888,0-0.354016,0.11299-0.421422,0.231268L8.163584,10.094586 c-0.103006,0.198888-0.40796,0.315052-0.655222,0.315052h-0.25052c-0.222712,0-0.490794-0.11299-0.59074-0.315052L4.086424,4.550138 l-1.39345,3.2847c-0.06173,0.19819-0.413702,0.252044-0.638758,0.252044H1.673898c-0.285852,0-0.477014-0.231268-0.349148-0.460812 l2.570072-6.173874c0.12075-0.221782,0.40058-0.349148,0.641774-0.349148h0.247502c0.233534,0,0.490794,0.127376,0.59074,0.349148 l0.838502,2.022774l2.457196-4.529812C8.694828,2.71383,9.084883,2.585552,9.332144,2.585552h0.27732 c0.247908,0,0.470526,0.127376,0.59074,0.349148l0.982936,1.821156L11.056073,1.353051z"></path>
                          </svg>
                        ) : (
                          // Single Grey Tick
                          <svg viewBox="0 0 16 15" width="16" height="15" className="" version="1.1" x="0px" y="0px" preserveAspectRatio="xMidYMid meet">
                            <path fill="#8696a0" d="M15.01,3.316l-7.8,7.801c-0.458,0.458-1.199,0.458-1.658,0L1.02,6.601c-0.458-0.458-0.458-1.199,0-1.659 c0.458-0.458,1.2-0.458,1.659,0l3.663,3.662l6.969-6.969c0.458-0.458,1.199-0.458,1.658,0l0.041,0.041 C15.468,2.133,15.468,2.875,15.01,3.316z"></path>
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Typing indicator */}
        {Object.keys(isTyping).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center text-gray-500 ml-4 mb-2"
          >
            <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-3 flex items-center gap-2 sticky bottom-0 z-10">
        <form onSubmit={handleSendMessage} className="flex gap-2 w-full max-w-4xl mx-auto items-center">
          {/* Optional: Add attachment button here if you want */}
          <input
            type="text"
            name="messageInput"
            autoComplete="off"
            placeholder="Type a message..."
            onInput={handleTyping}
            className="flex-1 px-4 py-3 bg-white dark:bg-[#2a3942] border-none rounded-lg focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 text-[15px] shadow-sm"
          />
          <button
            type="submit"
            className="p-3 text-[#54656f] dark:text-[#8696a0] hover:text-[#005c4b] dark:hover:text-[#00a884] transition-colors"
          >
            {/* Send Icon matching WhatsApp style */}
            <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" version="1.1" x="0px" y="0px" enableBackground="new 0 0 24 24">
              <path fill="currentColor" transform="translate(1.5, 2)" d="M1.101,21.757L23.8,11.114L1.109,0.471l0.003,8.26l17.436,2.443L1.114,13.607L1.101,21.757z"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
