import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { aiService } from '../../services/aiService';
import { blogService } from '../../services/blogService';
import { followService } from '../../services/followService';
import { ProfileEdit } from './ProfileEdit';
import { FollowListModal } from './FollowListModal';
import { MessageButton } from '../messaging/MessageButton';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [usage, setUsage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [postCount, setPostCount] = useState(0);
  const [modal, setModal] = useState({ open: false, type: 'followers' });

  useEffect(() => {
    loadUsage();
    if (user) {
      loadCounts();
      loadPostCount();
    }
  }, [user]);

  const loadUsage = async () => {
    try {
      const usageData = await aiService.getUsage();
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      const [followers, following] = await Promise.all([
        followService.getFollowerCount(user.id),
        followService.getFollowingCount(user.id)
      ]);
      setCounts({ followers, following });
    } catch (error) {
      console.error(error);
    }
  };

  const loadPostCount = async () => {
    try {
      const { blogService } = await import('../../services/blogService');
      const data = await blogService.searchByAuthor(user.username, 0, 1);
      setPostCount(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to load post count', error);
    }
  };

  const handleProfileUpdate = async () => {
    await updateUser();
    setEditing(false);
    await loadUsage();
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-96"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400 uppercase tracking-wider">Loading profile...</p>
        </div>
      </motion.div>
    );
  }

  if (editing) {
    return <ProfileEdit onCancel={() => setEditing(false)} onSave={handleProfileUpdate} />;
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with CTA */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Manage your personal information and settings</p>
          </div>
          <div className="flex gap-3">
            <MessageButton userId={user?.id} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(true)}
              className="px-6 md:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              ✏️ Edit Profile
            </motion.button>
          </div>
        </motion.div>

        {/* Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8"
        >
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="px-6 md:px-12 py-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Section */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center -mt-20"
              >
                <div className="relative mb-4">
                  {user?.profileImageUrl ? (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-4xl md:text-6xl font-bold text-white rounded-full border-4 border-white dark:border-gray-800 shadow-xl">
                      {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                    </div>
                  )}
                  {user?.emailVerified && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white">
                      ✓
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {!user?.emailVerified && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 text-xs font-bold rounded-full">
                      ⚠️ Unverified
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-bold rounded-full">
                    👤 {user?.role}
                  </span>
                </div>
              </motion.div>

              {/* Info Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 w-full"
              >
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-400 dark:text-gray-500 text-lg mb-6">@{user?.username}</p>

                {user?.bio && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                    <p className="text-gray-700 dark:text-gray-300 italic">"{user.bio}"</p>
                  </div>
                )}

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xl">📧</span>
                    <div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-semibold">Email</p>
                      <p className="text-gray-900 dark:text-white font-medium">{user?.email}</p>
                    </div>
                  </div>
                  {user?.mobileNumber && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-xl">📱</span>
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-semibold">Phone</p>
                        <p className="text-gray-900 dark:text-white font-medium">{user.mobileNumber}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-semibold">Member Since</p>
                      <p className="text-gray-900 dark:text-white font-medium">{memberSince}</p>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <motion.button
                    whileHover={{ y: -4 }}
                    onClick={() => setModal({ open: true, type: 'followers' })}
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-lg transition-all"
                  >
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{counts.followers}</div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">👥 Followers</div>
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -4 }}
                    onClick={() => setModal({ open: true, type: 'following' })}
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:shadow-lg transition-all"
                  >
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{counts.following}</div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">🔗 Following</div>
                  </motion.button>

                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30">
                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-1">{postCount}</div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">📝 Posts</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Modal */}
            <FollowListModal
              isOpen={modal.open}
              onClose={() => setModal(prev => ({ ...prev, open: false }))}
              type={modal.type}
              userId={user?.id}
            />
          </div>
        </motion.div>

        {/* Website Section */}
        {user?.website && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center rounded-lg text-xl">
                  🌐
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Website</h3>
                  <a
                    href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium truncate"
                  >
                    {user.website}
                  </a>
                </div>
              </div>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                Visit →
              </motion.a>
            </div>
          </motion.div>
        )}

        {/* AI Usage Stats */}
        {usage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 opacity-5 text-6xl">⚡</div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center rounded-lg text-xl">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">AI Request Usage</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{usage.used}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/ {usage.limit} daily requests</span>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Daily Quota</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round((usage.used / usage.limit) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  ></motion.div>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-3">
                  ↻ Resets daily at midnight UTC
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
