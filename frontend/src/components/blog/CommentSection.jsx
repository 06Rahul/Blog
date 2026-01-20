import { useState, useEffect } from 'react';
import { blogService } from '../../services/blogService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const CommentForm = ({ blogId, parentId = null, onSuccess, onCancel, placeholder = "What are your thoughts?" }) => {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        if (!user) {
            toast.error('Please login to comment');
            return;
        }

        setSubmitting(true);
        try {
            await blogService.addComment(blogId, content, parentId);
            setContent('');
            toast.success('Comment posted');
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200 my-4">
                <p className="text-gray-600 mb-4">Please login to join the discussion</p>
                <Link
                    to="/login"
                    className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                    Login
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="relative my-4">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                className="
w-full
p-4
border border-gray-300
rounded-lg
bg-gray-50 dark:bg-gray-800
text-gray-900 dark:text-gray-100
placeholder-gray-400
focus:ring-2 focus:ring-primary-500
focus:border-transparent
min-h-[100px]
resize-y
"


                required
                autoFocus={!!parentId}
            />

            <div className="mt-2 flex justify-end gap-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {submitting ? 'Posting...' : 'Post'}
                </button>
            </div>
        </form>
    );
};

const CommentItem = ({ comment, blogId, onReplySuccess, depth = 0 }) => {
    const [isReplying, setIsReplying] = useState(false);
    const { user } = useAuth();

    return (
        <div className={`mt-6 ${depth > 0 ? 'ml-8 sm:ml-12 border-l-2 border-gray-100 pl-4 sm:pl-6' : ''}`}>
            <div className="flex gap-3 sm:gap-4">
                <img
                    src={comment.authorProfileImageUrl || `https://ui-avatars.com/api/?name=${comment.authorUsername}&background=random`}
                    alt={comment.authorUsername}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{comment.authorUsername}</span>
                            <span className="text-xs text-gray-500">
                                {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                            </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{comment.content}</p>
                    </div>

                    <div className="mt-2 flex items-center gap-4">
                        {user && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
                            >
                                Reply
                            </button>
                        )}
                    </div>

                    {isReplying && (
                        <div className="mt-2">
                            <CommentForm
                                blogId={blogId}
                                parentId={comment.id}
                                onSuccess={() => {
                                    setIsReplying(false);
                                    onReplySuccess();
                                }}
                                onCancel={() => setIsReplying(false)}
                                placeholder={`Reply to ${comment.authorUsername}...`}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Recursively render replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            blogId={blogId}
                            onReplySuccess={onReplySuccess}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const CommentSection = ({ blogId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        loadComments(0, true);
    }, [blogId, refreshTrigger]);

    const loadComments = async (pageNum, reset = false) => {
        if (reset) setLoading(true);
        try {
            const data = await blogService.getComments(blogId, pageNum);
            if (reset) {
                setComments(data.content || []);
            } else {
                setComments((prev) => [...prev, ...(data.content || [])]);
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

    const handleCommentAdded = () => {
        // Simple strategy: Reload comments to get fresh tree
        // For better UX, we could optimistically update, but tree structure makes it complex
        setRefreshTrigger(prev => prev + 1);
    };

    const loadMore = () => {
        loadComments(page + 1);
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Comments
            </h2>

            {/* Main Comment Form */}
            <div className="mb-10">
                <CommentForm blogId={blogId} onSuccess={handleCommentAdded} />
            </div>

            {/* Comment List */}
            <div className="space-y-2">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        blogId={blogId}
                        onReplySuccess={handleCommentAdded}
                    />
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
                    <div className="text-center pt-8">
                        <button
                            onClick={loadMore}
                            className="px-6 py-2 border border-primary-600 text-primary-600 rounded-full hover:bg-primary-50 font-medium transition-colors"
                        >
                            Load more comments
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
