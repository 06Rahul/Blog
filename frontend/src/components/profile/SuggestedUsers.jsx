import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';
import { FollowButton } from './FollowButton';
import { userService } from '../../services/userService';

export const SuggestedUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        try {
            setLoading(true);
            const data = await userService.getSuggestions(15);
            setUsers(data);
        } catch (error) {
            console.error('Error loading suggestions', error);
        } finally {
            setLoading(false);
        }
    };

    const displayedUsers = showAll ? users : users.slice(0, 5);
    
    if (loading && users.length === 0) return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    if (users.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-widest">Suggested for you</h3>
                <button 
                  onClick={loadSuggestions} 
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                  title="Refresh suggestions"
                >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
            <div className="space-y-5">
                {displayedUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between group">
                        <Link to={`/profile/${user.username}`} className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold ring-2 ring-white dark:ring-gray-800 transition-all group-hover:ring-primary-100 dark:group-hover:ring-primary-900/30">
                                {user.profileImageUrl ? (
                                    <img 
                                        src={getImageUrl(user.profileImageUrl)} 
                                        alt={user.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user.username.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                                    {user.firstName} {user.lastName}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-xs truncate">@{user.username}</div>
                            </div>
                        </Link>
                        <div className="flex-shrink-0 ml-2">
                            <FollowButton targetUserId={user.id} className="!px-3 !py-1 text-xs font-bold" />
                        </div>
                    </div>
                ))}
            </div>
            
            {users.length > 5 && (
                <button 
                    onClick={() => setShowAll(!showAll)}
                    className="w-full mt-6 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 transition-all"
                >
                    {showAll ? 'Show Less' : `Show All (${users.length})`}
                </button>
            )}
        </div>
    );
};
