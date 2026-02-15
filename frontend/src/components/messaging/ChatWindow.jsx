import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messageService, webSocketService, conversationService } from '../../services/messagingService';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import { Send, MoreVertical, Phone, Video } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChatWindow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [isTyping, setIsTyping] = useState({});
  const messagesEndRef = useRef(null);

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

  // WebSocket Setup (simplified for brevity, assume works same as before)
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        await webSocketService.connect();
        webSocketService.subscribeToConversation(conversationId, (message) => {
          setMessages((prev) => [...prev, message]);
          messageService.markConversationAsRead(conversationId);
          scrollToBottom();
        });
        messageService.markConversationAsRead(conversationId);
      } catch (err) {
        console.error('WS Error', err);
      }
    };
    setupWebSocket();
    return () => {
      webSocketService.unsubscribeFromConversation(conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    if (messagesData?.content) {
      setMessages(messagesData.content);
      scrollToBottom();
    }
  }, [messagesData]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const input = e.target.elements.messageInput;
    const content = input.value.trim();
    if (!content) return;

    input.value = '';

    // Optimistic Update
    const tempMsg = {
      id: Date.now(),
      content,
      senderId: user.id,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    try {
      await messageService.sendMessage(conversationId, content);
    } catch (err) {
      toast.error('Failed to send');
    }
  };

  if (!conversationId) return <div className="h-full flex items-center justify-center text-gray-500">Select a chat</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          {conversation && (
            <>
              {conversation.otherUserProfileImage ? (
                <img src={getImageUrl(conversation.otherUserProfileImage)} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {conversation.otherUserUsername?.[0]}
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{conversation.otherUserUsername}</h3>
                <span className="flex items-center gap-2 text-xs text-green-500 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <Phone className="w-5 h-5 hover:text-gray-600 cursor-pointer" />
          <Video className="w-5 h-5 hover:text-gray-600 cursor-pointer" />
          <MoreVertical className="w-5 h-5 hover:text-gray-600 cursor-pointer" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/50">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${isMe
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-none'
                }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            name="messageInput"
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
          />
          <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
