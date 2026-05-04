import { useState, useEffect } from 'react';
import { followService } from '../../services/followService';
import { Link } from 'react-router-dom';

export const FollowListModal = ({ isOpen, onClose, type, userId }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    useEffect(() => {
        if (isOpen && userId) {
            setUsers([]);
            setPage(0);
            setHasMore(true);
            loadUsers(0);
        }
    }, [isOpen, userId, type]);

    const loadUsers = async (currentPage) => {
        setLoading(true);
        try {
            let response;
            if (type === 'followers') {
                response = await followService.getFollowers(userId, currentPage, pageSize);
            } else {
                response = await followService.getFollowing(userId, currentPage, pageSize);
            }

            if (currentPage === 0) {
                setUsers(response.content);
            } else {
                setUsers(prev => [...prev, ...response.content]);
            }

            setHasMore(!response.last);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadUsers(nextPage);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white capitalize">
                        {type === 'followers' ? 'Followers' : 'Following'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {users.map(user => (
                        <Link
                            key={user.id}
                            to={`/profile/${user.username}`}
                            onClick={onClose}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    user.username[0].toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                                    {user.firstName} {user.lastName}
                                </h3>
                                <p className="text-sm text-gray-400 truncate">@{user.username}</p>
                            </div>
                        </Link>
                    ))}

                    {loading && (
                        <div className="flex justify-center p-4">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {!loading && users.length === 0 && (
                        <p className="text-center text-gray-400 py-8">
                            {type === 'followers' ? 'No followers yet' : 'Not following anyone'}
                        </p>
                    )}

                    {!loading && hasMore && users.length > 0 && (
                        <button
                            onClick={handleLoadMore}
                            className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
                        >
                            Load More
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
