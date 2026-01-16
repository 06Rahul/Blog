import { useState, useEffect } from 'react';
import { blogService } from '../../services/blogService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const CommentSection = ({ blogId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        loadComments(0, true);
    }, [blogId]);

    const loadComments = async (pageNum, reset = false) => {
        try {
            const data = await blogService.getComments(blogId, pageNum);
            if (reset) {
                setComments(data.content);
            } else {
                setComments((prev) => [...prev, ...data.content]);
            }
            setHasMore(!data.last);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading comments:', error);
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!user) {
            toast.error('Please login to comment');
            return;
        }

        setSubmitting(true);
        try {
            const addedComment = await blogService.addComment(blogId, newComment);
            setComments((prev) => [addedComment, ...prev]);
            setNewComment('');
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const loadMore = () => {
        loadComments(page + 1);
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Comments ({comments.length})</h2>

            {/* Comment Form */}
            <div className="mb-10">
                {user ? (
                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="What are your thoughts?"
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px] resize-y"
                            required
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                        <p className="text-gray-600 mb-4">Please login to join the discussion</p>
                        <Link
                            to="/login"
                            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                        >
                            Login
                        </Link>
                    </div>
                )}
            </div>

            {/* Comment List */}
            <div className="space-y-8">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                        <img
                            src={comment.authorProfileImageUrl || `https://ui-avatars.com/api/?name=${comment.authorName}&background=random`}
                            alt={comment.authorName}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900">{comment.authorName}</h3>
                                    <span className="text-sm text-gray-500">
                                        {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                                    </span>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {comments.length === 0 && !loading && (
                    <p className="text-center text-gray-500 py-8">No comments yet. Be the first to share your thoughts!</p>
                )}

                {loading && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                )}

                {hasMore && !loading && (
                    <div className="text-center pt-4">
                        <button
                            onClick={loadMore}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Load more comments
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
