import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { conversationService, followService } from '../../services/messagingService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUrl';

export const ChatList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { data, isLoading, error } = useQuery({
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

  const handleSelectConversation = (conversationId) => {
    navigate(`/messages/${conversationId}`);
  };

  const handleStartConversation = async (userId) => {
    try {
      await conversationService.getOrCreateConversation(userId);
      setShowNewConversationModal(false);
      navigate(`/messages`);
      toast.success('Conversation created!');
    } catch (err) {
      toast.error('Failed to create conversation');
    }
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await conversationService.deleteConversation(conversationId);
      toast.success('Conversation deleted');
    } catch (err) {
      toast.error('Failed to delete conversation');
    }
  };

  const handleNewConversationClick = () => {
    loadFollowersAndFollowing();
    setShowNewConversationModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading conversations
      </div>
    );
  }

  const conversations = data?.content || [];

  return (
    <>
      <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">💬 Messages</h2>
          </div>
          
          {/* Start New Conversation Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewConversationClick}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            ✉️ Start new conversation
          </motion.button>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-5xl mb-4">💬</div>
            <p className="font-semibold">No conversations yet</p>
            <p className="text-sm mt-2">Start chatting with people you follow!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conv, index) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectConversation(conv.id)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="relative">
                    {conv.otherUserProfileImage ? (
                      <img
                        src={getImageUrl(conv.otherUserProfileImage)}
                        alt={conv.otherUserUsername}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                        {conv.otherUserUsername?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {conv.otherUserUsername}
                    </p>
                    <p className={`text-sm truncate ${
                      conv.unreadCount > 0 
                        ? 'text-gray-900 dark:text-white font-medium' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete conversation"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewConversationModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-96 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Start new conversation</h3>
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Users List */}
            {loadingUsers ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                {followers.length > 0 ? (
                  <>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      👥 Followers
                    </div>
                    {followers.map((user) => (
                      <motion.button
                        key={user.id}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                        onClick={() => handleStartConversation(user.id)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        {user.profileImageUrl ? (
                          <img
                            src={getImageUrl(user.profileImageUrl)}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                        </div>
                      </motion.button>
                    ))}
                  </>
                ) : null}

                {following.length > 0 ? (
                  <>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      🔗 Following
                    </div>
                    {following.map((user) => (
                      <motion.button
                        key={user.id}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                        onClick={() => handleStartConversation(user.id)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        {user.profileImageUrl ? (
                          <img
                            src={getImageUrl(user.profileImageUrl)}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                        </div>
                      </motion.button>
                    ))}
                  </>
                ) : null}

                {followers.length === 0 && following.length === 0 && (
                  <div className="flex items-center justify-center p-8 text-gray-500">
                    <p>No users to start conversation with</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
