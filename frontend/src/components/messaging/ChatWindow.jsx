import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { messageService, webSocketService, conversationService } from '../../services/messagingService';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import { Send, MoreVertical, Phone, Video, X, Check, CheckCheck, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageStatus = ({ status, isSender }) => {
  if (!isSender) return null;
  if (status === 'READ') return <CheckCheck className="w-4 h-4 text-blue-400" />;
  if (status === 'DELIVERED') return <CheckCheck className="w-4 h-4 text-gray-300" />;
  return <Check className="w-4 h-4 text-gray-300" />;
};

export const ChatWindow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [page] = useState(0);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [presence, setPresence] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: messagesData } = useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () => messageService.getMessages(conversationId, page, 50),
    staleTime: 0,
    enabled: !!conversationId
  });

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => conversationService.getConversation(conversationId),
    enabled: !!conversationId
  });

  useEffect(() => {
    if (!conversationId || !user?.id) return;

    let heartbeat;
    const setupWebSocket = async () => {
      try {
        await webSocketService.connect();
        webSocketService.markPresenceOnline(user.id);
        heartbeat = setInterval(() => webSocketService.heartbeatPresence(user.id), 20000);

        webSocketService.subscribeToConversation(conversationId, (message) => {
          setMessages((prev) => [...prev, message]);
          if (message.senderId !== user.id) {
            messageService.markAsDelivered(message.id).catch(() => {});
            messageService.markConversationAsRead(conversationId).catch(() => {});
          }
          scrollToBottom();
        });

        webSocketService.subscribeToMessageStatus(conversationId, (statusUpdate) => {
          setMessages((prev) => prev.map((message) => (
            message.id === statusUpdate.messageId
              ? { ...message, status: statusUpdate.status, deliveredAt: statusUpdate.deliveredAt, readAt: statusUpdate.readAt }
              : message
          )));
        });

        if (conversation?.otherUserId) {
          webSocketService.subscribeToPresence(conversation.otherUserId, setPresence);
        }

        messageService.markConversationAsRead(conversationId).catch(() => {});
      } catch (err) {
        console.error('WS Error', err);
      }
    };

    setupWebSocket();
    return () => {
      if (heartbeat) clearInterval(heartbeat);
      webSocketService.markPresenceOffline(user.id);
      webSocketService.unsubscribeFromConversation(conversationId);
      webSocketService.unsubscribeFromMessageStatus(conversationId);
      if (conversation?.otherUserId) {
        webSocketService.unsubscribeFromPresence(conversation.otherUserId);
      }
    };
  }, [conversationId, conversation?.otherUserId, user?.id]);

  useEffect(() => {
    if (!messagesData?.content) return;
    setMessages(messagesData.content);
    messagesData.content
      .filter((message) => message.senderId !== user?.id && message.status === 'SENT')
      .forEach((message) => {
        messageService.markAsDelivered(message.id).catch(() => {});
      });
    scrollToBottom();
  }, [messagesData, user?.id]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const input = e.target.elements.messageInput;
    const content = input.value.trim();
    if (!content) return;

    input.value = '';

    try {
      if (webSocketService.client?.connected) {
        webSocketService.sendMessage(conversationId, { content, mediaUrl: null, messageType: 'TEXT' });
      } else {
        const sentMessage = await messageService.sendMessage(conversationId, content);
        setMessages((prev) => [...prev, sentMessage]);
        scrollToBottom();
      }
    } catch (err) {
      toast.error('Failed to send');
    }
  };

  const handleAccept = async () => {
    try {
      await conversationService.acceptConversation(conversationId);
      toast.success('Conversation accepted!');
      window.location.reload(); // Refresh to update status
    } catch (err) {
      toast.error('Failed to accept conversation');
    }
  };

  const handleReject = async () => {
    try {
      if (window.confirm('Are you sure you want to reject this request?')) {
        await conversationService.rejectConversation(conversationId);
        toast.success('Conversation rejected');
        navigate('/messages');
      }
    } catch (err) {
      toast.error('Failed to reject conversation');
    }
  };

  const isInitiator = conversation?.initiatorId === user?.id;
  const isPending = conversation?.status === 'REQUESTED';
  const isRejected = conversation?.status === 'REJECTED';

  const otherUserOnline = presence?.online ?? conversation?.otherUserOnline;
  const lastSeen = presence?.lastSeenAt ?? conversation?.otherUserLastSeenAt;

  if (!conversationId) {
    return <div className="h-full flex items-center justify-center text-gray-500">Select a chat</div>;
  }

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          {conversation && (
            <>
              {conversation.otherUserProfileImage ? (
                <img
                  src={getImageUrl(conversation.otherUserProfileImage)}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  onClick={() => setShowUserInfo(true)}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold cursor-pointer"
                  onClick={() => setShowUserInfo(true)}
                >
                  {conversation.otherUserUsername?.[0]}
                </div>
              )}
              <div>
                <h3 
                  className="font-bold text-gray-900 dark:text-white cursor-pointer hover:underline hover:text-blue-600 transition-colors"
                  onClick={() => setShowUserInfo(true)}
                >
                  {conversation.otherUserDisplayName || conversation.otherUserUsername}
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400">@{conversation.otherUserUsername}</div>
                <span className={`flex items-center gap-2 text-xs font-medium ${otherUserOnline ? 'text-green-500' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${otherUserOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  {otherUserOnline
                    ? 'Online'
                    : lastSeen
                      ? `Last seen ${new Date(lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Offline'}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <Phone className="w-5 h-5 hover:text-gray-600 cursor-pointer" />
          <Video className="w-5 h-5 hover:text-gray-600 cursor-pointer" />
          <MoreVertical className="w-5 h-5 hover:text-gray-600 cursor-pointer" onClick={() => setShowUserInfo(true)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/50 relative">
        {isPending && !isInitiator && (
          <div className="absolute inset-x-0 top-0 z-10 p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="font-medium text-sm">This user wants to message you</p>
            <div className="flex gap-4">
              <button onClick={handleAccept} className="px-6 py-1.5 bg-white text-blue-600 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors shadow-md">Accept</button>
              <button onClick={handleReject} className="px-6 py-1.5 bg-transparent border border-white/50 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-colors">Decline</button>
            </div>
          </div>
        )}

        {isPending && isInitiator && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 opacity-75">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Send className="w-8 h-8 animate-pulse" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">Request Sent</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{conversation.otherUserUsername} will see your message after they accept your request.</p>
          </div>
        )}

        {isRejected && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 opacity-75">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
              <X className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">Request Declined</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">You cannot send messages to this user.</p>
          </div>
        )}

        {(!isPending || !isInitiator) && !isRejected && messages.map((msg, index) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${isMe
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-none'}`}>
                <div>{msg.content}</div>
                <div className={`mt-1 flex items-center gap-1 text-[11px] ${isMe ? 'justify-end text-blue-100' : 'justify-start text-gray-400'}`}>
                  <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  <MessageStatus status={msg.status} isSender={isMe} />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            name="messageInput"
            type="text"
            placeholder={isPending ? "Waiting for acceptance..." : "Type your message..."}
            disabled={isPending || isRejected}
            onFocus={() => webSocketService.heartbeatPresence(user?.id)}
            className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isPending || isRejected}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:bg-gray-400 disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {showUserInfo && conversation && (
        <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-20 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Info</h2>
            <button onClick={() => setShowUserInfo(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center">
            {conversation.otherUserProfileImage ? (
              <img
                src={getImageUrl(conversation.otherUserProfileImage)}
                alt={conversation.otherUserUsername}
                className="w-28 h-28 rounded-full mx-auto object-cover mb-4"
              />
            ) : (
              <div className="w-28 h-28 rounded-full mx-auto mb-4 bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold">
                {conversation.otherUserUsername?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {conversation.otherUserDisplayName || conversation.otherUserUsername}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">@{conversation.otherUserUsername}</div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Bio</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {conversation.otherUserBio || 'No bio available'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Contact</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {conversation.otherUserContactInfo || 'Not shared'}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate(`/profile/${conversation.otherUserUsername}`)}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserCircle className="w-4 h-4" />
              View Profile
            </button>
            <button className="w-full py-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
              Block User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
