import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../services/communityService';
import { userService } from '../services/userService';
import { Loader, MessageSquare, CornerDownRight, ThumbsUp, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const ReplyItem = ({ reply, threadId, onReply, depth = 0 }) => {
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);

    // Nesting limit to avoid deep indentation issues
    if (depth > 5) depth = 5;

    return (
        <div className={`mt-4 ${depth > 0 ? 'ml-6 border-l-2 border-gray-100 dark:border-gray-700 pl-4' : ''}`}>
            <div className="flex items-start space-x-3">
                <img
                    src={reply.authorImage || `https://ui-avatars.com/api/?name=${reply.authorName}&background=random`}
                    alt={reply.authorName}
                    className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-750/50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-200">
                                {reply.authorName}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 whitespace-pre-wrap">
                            {/* Simple mention highlighting with Link */}
                            {reply.content.split(/(@\w+)/g).map((part, i) =>
                                part.startsWith('@') ?
                                    (
                                        <Link key={i} to={`/profile/${part.substring(1)}`} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                                            {part}
                                        </Link>
                                    ) : (
                                        part
                                    )
                            )}
                        </p>
                    </div>

                    <div className="flex items-center space-x-4 mt-1 ml-1">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-xs font-medium text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
                        >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Reply
                        </button>
                    </div>

                    {isReplying && (
                        <div className="mt-3">
                            <ReplyInput
                                threadId={threadId}
                                parentId={reply.id}
                                onCancel={() => setIsReplying(false)}
                                onSuccess={() => setIsReplying(false)}
                                placeholder={`Replying to @${reply.authorName}...`}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Recursively render child replies */}
            {reply.replies && reply.replies.length > 0 && (
                <div className="mt-2">
                    {reply.replies.map(childReply => (
                        <ReplyItem
                            key={childReply.id}
                            reply={childReply}
                            threadId={threadId}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ReplyInput = ({ threadId, parentId = null, onCancel, onSuccess, placeholder }) => {
    const [content, setContent] = useState('');
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionResults, setMentionResults] = useState([]);
    const [showMentions, setShowMentions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);
    const queryClient = useQueryClient();

    const replyMutation = useMutation({
        mutationFn: (text) => communityService.createReply(threadId, { content: text, parentId }),
        onSuccess: () => {
            queryClient.invalidateQueries(['threadReplies', threadId]);
            setContent('');
            if (onSuccess) onSuccess();
        }
    });

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
            // Check if there's a space after @, if so, stop searching (unless we want multi-word search, but username is usually one word)
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

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder={placeholder || "Write a comment..."}
                rows={3}
                value={content}
                onChange={handleInput}
            />

            {showMentions && mentionResults.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {mentionResults.map(user => (
                        <button
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

            <div className="mt-2 flex justify-end space-x-2">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={() => replyMutation.mutate(content)}
                    disabled={!content.trim() || replyMutation.isPending}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                >
                    {replyMutation.isPending ? 'Posting...' : 'Comment'}
                </button>
            </div>
        </div>
    );
};

export const ThreadPage = () => {
    const { threadId } = useParams();
    const { user } = useAuth();

    const { data: thread, isLoading: threadLoading, isError, error } = useQuery({
        queryKey: ['thread', threadId],
        queryFn: () => communityService.getThreadById(threadId)
    });

    const { data: repliesPage, isLoading: repliesLoading } = useQuery({
        queryKey: ['threadReplies', threadId],
        queryFn: () => communityService.getThreadReplies(threadId),
        enabled: !!threadId
    });

    const replies = repliesPage?.content || [];

    if (threadLoading) return <div className="flex justify-center p-12"><Loader className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    if (isError) return <div className="text-center py-12 text-red-600">Error: {error.message}</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <span className="font-medium text-gray-900 dark:text-gray-300">c/{thread.communityName}</span>
                    <span>•</span>
                    <span>Posted by {thread.authorUsername}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{thread.title}</h1>
                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-300">
                    <div dangerouslySetInnerHTML={{ __html: thread.content }} />
                </div>
                <div className="mt-6 flex items-center space-x-4 border-t border-gray-200 dark:border-gray-700 pt-4 text-gray-500">
                    <div className="flex items-center"><MessageSquare className="w-4 h-4 mr-1.5" />{thread.replyCount || replies.length} Comments</div>

                    {/* Permissions: Edit/Delete */}
                    {(user && (user.id === thread.authorId || user.role === 'ADMIN')) && (
                        <div className="flex items-center space-x-3 ml-auto">
                            <button
                                onClick={() => {/* TODO: Implement Edit Modal */ }}
                                className="text-gray-500 hover:text-blue-600 text-sm font-medium"
                            >
                                Edit
                            </button>
                            <button
                                onClick={async () => {
                                    if (window.confirm('Delete this thread?')) {
                                        await communityService.deleteThread(threadId); // Need to implement in service
                                        // Redirect to community
                                    }
                                }}
                                className="text-gray-500 hover:text-red-600 text-sm font-medium flex items-center"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Comments</h3>

                {user ? (
                    <div className="mb-8">
                        <ReplyInput threadId={threadId} />
                    </div>
                ) : (
                    <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-md text-center"><p className="text-gray-600 dark:text-gray-300">Log in to comment</p></div>
                )}

                {repliesLoading ? (
                    <div className="text-center py-4"><Loader className="w-6 h-6 animate-spin mx-auto text-indigo-500" /></div>
                ) : (
                    <div className="space-y-6">
                        {replies.length > 0 ? (
                            replies.map(reply => (
                                <ReplyItem key={reply.id} reply={reply} threadId={threadId} />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
