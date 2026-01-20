import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';
import { FollowButton } from '../components/profile/FollowButton';
import { FollowListModal } from '../components/profile/FollowListModal';
import { MessageButton } from '../components/messaging/MessageButton';
import { followService } from '../services/followService';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const UserProfile = () => {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ followers: 0, following: 0 });
    const [postCount, setPostCount] = useState(0);
    const [modal, setModal] = useState({ open: false, type: 'followers' });

    useEffect(() => {
        loadUserProfile();
    }, [username]);

    useEffect(() => {
        if (user) {
            loadCounts();
            loadPostCount();
        }
    }, [user]);

    const loadUserProfile = async () => {
        try {
            const response = await axios.get(`/api/users/username/${username}`);
            setUser(response.data);
        } catch (error) {
            toast.error('Failed to load user profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadPostCount = async () => {
        try {
            // Fetch 1 item just to get totalElements
            const data = await import('../services/blogService').then(m => m.blogService.searchByAuthor(user.username, 0, 1));
            setPostCount(data.totalElements || 0);
        } catch (error) {
            console.error('Failed to load post count', error);
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

    const handleFollowChange = (isFollowing) => {
        setCounts(prev => ({
            ...prev,
            followers: isFollowing ? prev.followers + 1 : prev.followers - 1
        }));
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

    if (!user) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto px-4 py-12 text-center"
            >
                <div className="inline-block p-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">🔍 User Not Found</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">The user you're looking for doesn't exist.</p>
                    <Link
                        to="/"
                        className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                    >
                        ← Go Home
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-4 md:p-8"
        >
            <div className="max-w-6xl mx-auto">
                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8"
                >
                    {/* Header Gradient */}
                    <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    <div className="px-6 md:px-12 py-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar Section */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="-mt-20"
                            >
                                <div className="relative">
                                    {user.profileImageUrl ? (
                                        <motion.img
                                            whileHover={{ scale: 1.05 }}
                                            src={user.profileImageUrl}
                                            alt={user.username}
                                            className="w-40 h-40 object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-xl"
                                        />
                                    ) : (
                                        <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-6xl font-bold text-white rounded-full border-4 border-white dark:border-gray-800 shadow-xl">
                                            {user.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Profile Info */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex-1 w-full"
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                                            {user.firstName} {user.lastName}
                                        </h1>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg">@{user.username}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <MessageButton userId={user.id} />
                                        <FollowButton
                                            targetUserId={user.id}
                                            onFollowChange={handleFollowChange}
                                        />
                                    </div>
                                </div>

                                {user.bio && (
                                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                                        <p className="text-gray-700 dark:text-gray-300 italic">"{user.bio}"</p>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
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

                                {/* Metadata */}
                                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    {user.website && (
                                        <a
                                            href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                        >
                                            🌐 {user.website}
                                        </a>
                                    )}
                                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        👤 {user.role}
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* User's Blogs Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div className="px-6 md:px-12 py-8 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                            📝 Blogs by {user.firstName}
                        </h2>
                    </div>

                    <div className="p-6 md:p-12">
                        <BlogList type="author" username={user.username} />
                    </div>
                </motion.div>

                {/* Follow List Modal */}
                {/* Follow List Modal */}
                <FollowListModal
                    isOpen={modal.open}
                    onClose={() => setModal(prev => ({ ...prev, open: false }))}
                    type={modal.type}
                    userId={user.id}
                />
            </div>
        </motion.div>
    );
};
