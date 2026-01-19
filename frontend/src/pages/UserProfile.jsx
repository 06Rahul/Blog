import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';
import { FollowButton } from '../components/profile/FollowButton';
import { FollowListModal } from '../components/profile/FollowListModal';
import { followService } from '../services/followService';
import axios from 'axios';
import toast from 'react-hot-toast';

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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
                    <Link to="/" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
                        Go back home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 border border-slate-700">
                <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-full ring-4 ring-blue-500/30 overflow-hidden shadow-2xl relative">
                            {user.profileImageUrl ? (
                                <img
                                    src={user.profileImageUrl}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <p className="text-xl text-blue-400">@{user.username}</p>
                            </div>
                            <FollowButton
                                targetUserId={user.id}
                                onFollowChange={handleFollowChange}
                            />
                        </div>

                        {user.bio && (
                            <p className="text-gray-300 mb-6 text-lg leading-relaxed max-w-2xl">{user.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-6 mb-6">
                            <button
                                onClick={() => setModal({ open: true, type: 'followers' })}
                                className="flex flex-col items-center hover:bg-slate-700/50 p-2 rounded-lg transition-colors cursor-pointer group"
                            >
                                <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{counts.followers}</span>
                                <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold group-hover:text-blue-400 transition-colors">Followers</span>
                            </button>
                            <button
                                onClick={() => setModal({ open: true, type: 'following' })}
                                className="flex flex-col items-center hover:bg-slate-700/50 p-2 rounded-lg transition-colors cursor-pointer group"
                            >
                                <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{counts.following}</span>
                                <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold group-hover:text-blue-400 transition-colors">Following</span>
                            </button>
                            <div className="flex flex-col items-center p-2">
                                <span className="text-2xl font-bold text-white">{postCount}</span>
                                <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Posts</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            {user.website && (
                                <a
                                    href={user.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    {user.website}
                                </a>
                            )}
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* User's Blogs */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-blue-500">
                    Blogs by {user.firstName}
                </h2>
                <BlogList type="author" username={user.username} />
            </div>

            <FollowListModal
                isOpen={modal.open}
                onClose={() => setModal(prev => ({ ...prev, open: false }))}
                type={modal.type}
                userId={user.id}
            />
        </div>
    );
};
