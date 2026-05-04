import { useState, useEffect, useRef } from 'react';
import { blogService } from '../../services/blogService';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const CommentForm = ({ blogId, parentId = null, onSuccess, onCancel, placeholder = "What are your thoughts?" }) => {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionResults, setMentionResults] = useState([]);
    const [showMentions, setShowMentions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);
    const { user } = useAuth();

    // Handle Mention Search
    useEffect(() => {
        if (!showMentions) return;

        const timer = setTimeout(async () => {
            if (mentionQuery.length >= 1) {
                try {
                    const users = await userService.searchUsers(mentionQuery);
                    setMentionResults(users);
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setMentionResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [mentionQuery, showMentions]);

    const handleInput = (e) => {
        const val = e.target.value;
        const cursorPos = e.target.selectionStart;
        setContent(val);
        setCursorPosition(cursorPos);

        // Detect @
        const textBeforeCursor = val.slice(0, cursorPos);
        const lastAt = textBeforeCursor.lastIndexOf('@');

        if (lastAt !== -1) {
            const query = textBeforeCursor.slice(lastAt + 1);
            if (!query.includes(' ')) {
                setMentionQuery(query);
                setShowMentions(true);
                return;
            }
        }
        setShowMentions(false);
    };

    const insertMention = (username) => {
        const textBeforeCursor = content.slice(0, cursorPosition);
        const lastAt = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = content.slice(cursorPosition);

        const newText = content.slice(0, lastAt) + `@${username} ` + textAfterCursor;
        setContent(newText);
        setShowMentions(false);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

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
                ref={textareaRef}
                value={content}
                onChange={handleInput}
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

            {showMentions && mentionResults.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {mentionResults.map(user => (
                        <button
                            type="button"
                            key={user.id}
                            onClick={() => insertMention(user.username)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                            <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}`} className="w-5 h-5 rounded-full" alt="" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{user.username}</span>
                        </button>
                    ))}
                </div>
            )}

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
    const [liked, setLiked] = useState(!!comment.isLiked);
    const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
    const { user } = useAuth();

    useEffect(() => {
        const loadLikeState = async () => {
            try {
                const data = await blogService.getCommentLikeStatus(comment.id);
                setLiked(!!data.isLiked);
                setLikeCount(data.count || 0);
            } catch (error) {
                console.error('Failed to load comment like state', error);
            }
        };

        if (user) {
            loadLikeState();
        }
    }, [comment.id, user]);

    const renderMentions = (text) => {
        const mentionRegex = /@([A-Za-z0-9._-]+)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }

            parts.push(
                <Link
                    key={`${comment.id}-${match.index}`}
                    to={`/profile/${encodeURIComponent(match[1])}`}
                    className="text-primary-600 font-medium hover:underline"
                >
                    @{match[1]}
                </Link>
            );

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts;
    };

    const handleLike = async () => {
        try {
            await blogService.likeComment(comment.id);
            setLiked((prev) => !prev);
            setLikeCount((prev) => prev + (liked ? -1 : 1));
        } catch (error) {
            toast.error('Failed to update comment like');
        }
    };

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
                        <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">
                            {renderMentions(comment.content)}
                        </p>
                    </div>

                    <div className="mt-2 flex items-center gap-4">
                        {user && (
                            <button
                                onClick={handleLike}
                                className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                            >
                                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                                <span>{likeCount}</span>
                            </button>
                        )}
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
