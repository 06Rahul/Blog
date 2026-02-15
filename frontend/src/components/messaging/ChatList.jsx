import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { conversationService, followService } from '../../services/messagingService';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUrl';
import { Plus, Search } from 'lucide-react';

export const ChatList = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [page, setPage] = useState(0);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['conversations', page],
    queryFn: () => conversationService.getConversations(page, 20),
    staleTime: 5 * 60 * 1000,
  });

  const loadFollowersAndFollowing = async () => {
    setLoadingUsers(true);
    try {
      const [followersList, followingList] = await Promise.all([
        followService.getFollowers(),
        followService.getFollowing()
      ]);
      setFollowers(followersList);
      setFollowing(followingList);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleNewConversationClick = () => {
    loadFollowersAndFollowing();
    setShowNewConversationModal(true);
  };

  const handleStartConversation = async (userId) => {
    try {
      const conversation = await conversationService.getOrCreateConversation(userId);
      setShowNewConversationModal(false);
      if (conversation && conversation.id) {
        navigate(`/messages/${conversation.id}`);
      } else {
        navigate('/messages');
      }
    } catch (err) {
      toast.error('Failed to start conversation');
    }
  };

  const conversations = data?.content || [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
          <button
            onClick={handleNewConversationClick}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-sm focus:ring-1 focus:ring-blue-500 dark:text-white transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : conversations.length === 0 ? (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400 text-sm">
            No conversations yet. Start a new one!
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => navigate(`/messages/${conv.id}`)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left relative ${conversationId === conv.id ? 'bg-blue-50 dark:bg-blue-900/20 shadow-inner' : ''
                  }`}
              >
                <div className="relative">
                  {conv.otherUserProfileImage ? (
                    <img src={getImageUrl(conv.otherUserProfileImage)} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {conv.otherUserUsername?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm truncate ${conversationId === conv.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                    {conv.otherUserUsername}
                  </h4>
                  <p className={`text-xs truncate mt-1 ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {conv.lastMessage || 'Start a conversation'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Conversation Modal can remain mostly the same or be refactored, keeping it simple here */}
      {showNewConversationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowNewConversationModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md m-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">New Message</h3>
              <button onClick={() => setShowNewConversationModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loadingUsers ? (
                <div className="p-4 text-center">Loading...</div>
              ) : (
                <>
                  {[...followers, ...following].length === 0 && <p className="p-4 text-center text-gray-500">Follow people to start chatting!</p>}
                  {[...followers, ...following].map(user => (
                    <button key={user.id} onClick={() => handleStartConversation(user.id)} className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">{user.username[0]}</div>
                      <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
