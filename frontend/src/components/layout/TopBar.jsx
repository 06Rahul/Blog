import { Search, Bell, User as UserIcon, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TopBar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all dark:text-white"
                    />
                </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        {/* New Post Button */}
                        <Link to="/blogs/new" className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all">
                            <Plus className="w-4 h-4" />
                            <span>Create</span>
                        </Link>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                            </button>
                        </div>

                        {/* Profile */}
                        <Link to={`/profile/${user.username}`} className="flex items-center gap-3">
                            {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="hidden md:block text-sm text-left">
                                <p className="font-semibold text-gray-900 dark:text-white leading-tight">{user.firstName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                            </div>
                        </Link>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Log in</Link>
                        <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all">Sign up</Link>
                    </div>
                )}
            </div>
        </header>
    );
};
