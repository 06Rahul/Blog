import { useState, useEffect } from 'react';
import { blogService } from '../../services/blogService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const LikeButton = ({ blogId }) => {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchLikeStatus();
    }, [blogId]);

    const fetchLikeStatus = async () => {
        try {
            const data = await blogService.getLikeStatus(blogId);
            setCount(data.count);
            setLiked(data.isLiked);
        } catch (error) {
            console.error('Error fetching like status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLike = async () => {
        if (!user) {
            toast.error('Please login to like this blog');
            return;
        }

        // Optimistic update
        const previousLiked = liked;
        const previousCount = count;

        setLiked(!liked);
        setCount(liked ? count - 1 : count + 1);

        try {
            await blogService.toggleLike(blogId);
        } catch (error) {
            // Revert if failed
            setLiked(previousLiked);
            setCount(previousCount);
            toast.error('Failed to update like');
        }
    };

    if (loading) return <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>;

    return (
        <button
            onClick={handleToggleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${liked
                    ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${liked ? 'fill-current' : 'fill-none'}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
            <span className="font-medium">{count}</span>
        </button>
    );
};
