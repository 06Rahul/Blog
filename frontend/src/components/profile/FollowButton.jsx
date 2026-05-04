import { useState, useEffect } from 'react';
import { followService } from '../../services/followService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const FollowButton = ({ targetUserId, onFollowChange, className = '' }) => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (targetUserId && user) {
            checkStatus();
        } else {
            setLoading(false);
        }
    }, [targetUserId, user]);

    const checkStatus = async () => {
        try {
            const status = await followService.isFollowing(targetUserId);
            setIsFollowing(status);
        } catch (error) {
            console.error('Failed to check follow status', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!user) {
            toast.error('Please login to follow authors');
            return;
        }

        setLoading(true);
        try {
            if (isFollowing) {
                await followService.unfollowUser(targetUserId);
                setIsFollowing(false);
                toast.success('Unfollowed successfully');
            } else {
                await followService.followUser(targetUserId);
                setIsFollowing(true);
                toast.success('Followed successfully');
            }
            if (onFollowChange) onFollowChange(!isFollowing);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update follow status');
        } finally {
            setLoading(false);
        }
    };

    // Hide only if user is logged in and viewing their own profile
    if (user && user.id === targetUserId) {
        return (
            <Link
                to="/profile"
                className={`px-6 py-2 rounded-xl font-semibold transition-all shadow-lg bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 ${className}`}
            >
                Edit Profile
            </Link>
        );
    }

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`px-6 py-2 rounded-xl font-semibold transition-all shadow-lg ${isFollowing
                ? 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/20'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading
                </span>
            ) : isFollowing ? (
                'Following'
            ) : (
                'Follow'
            )}
        </button>
    );
};
