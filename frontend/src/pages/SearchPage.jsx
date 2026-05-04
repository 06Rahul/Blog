import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchService } from '../services/searchService';
import { Loader, Search as SearchIcon, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState({ communities: [], threads: [], blogs: [], users: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (initialQuery) {
            fetchResults(initialQuery);
        }
    }, [initialQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchParams({ q: query });
            fetchResults(query);
        }
    };

    const fetchResults = async (searchQuery) => {
        setLoading(true);
        try {
            setResults(await searchService.search(searchQuery));
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'posts', label: 'Posts', count: results.blogs?.length },
        { id: 'users', label: 'Users', count: results.users?.length },
        { id: 'communities', label: 'Communities', count: results.communities?.length },
        { id: 'threads', label: 'Threads', count: results.threads?.length },
    ];

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Search</h1>
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for posts, people, communities..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </form>
            </div>

            {initialQuery && (
                <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 text-sm font-medium transition-all relative ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                                        {tab.count}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="searchTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : initialQuery && (
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-8">
                    {(activeTab === 'all' || activeTab === 'users') && results.users?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {activeTab === 'all' && <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white">People</div>}
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {results.users.slice(0, activeTab === 'all' ? 3 : undefined).map((user) => (
                                    <motion.div key={user.id} variants={itemVariants} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <Link to={`/profile/${user.username}`} className="flex items-center gap-4">
                                            {user.profileImageUrl ? (
                                                <img src={user.profileImageUrl} className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                    {user.username?.[0]}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{user.username}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(activeTab === 'all' || activeTab === 'posts') && results.blogs?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {activeTab === 'all' && <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white">Posts</div>}
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {results.blogs.slice(0, activeTab === 'all' ? 3 : undefined).map((blog) => (
                                    <motion.div key={blog.id} variants={itemVariants} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <Link to={`/blogs/${blog.id}`} className="block group">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 mb-2">{blog.title}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                                                {blog.summary || blog.content?.substring(0, 150)}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                                <span>{blog.publishedAt ? format(new Date(blog.publishedAt), 'MMM d, yyyy') : 'Draft'}</span>
                                                <span>&bull;</span>
                                                <span>by {blog.authorUsername}</span>
                                                {blog.communityExclusive && (
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Members only</span>
                                                )}
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(activeTab === 'all' || activeTab === 'communities') && results.communities?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {activeTab === 'all' && <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white">Communities</div>}
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.communities.map((comm) => (
                                    <Link key={comm.id} to={`/communities/${comm.id}`} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-colors">
                                        <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                            {comm.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{comm.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{comm.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {(activeTab === 'all' || activeTab === 'threads') && results.threads?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {activeTab === 'all' && <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white">Threads</div>}
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {results.threads.slice(0, activeTab === 'all' ? 3 : undefined).map((thread) => (
                                    <motion.div key={thread.id} variants={itemVariants} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <Link to={`/threads/${thread.id}`} className="block">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>{thread.communityName}</span>
                                                <span>&bull;</span>
                                                <span>by {thread.authorName}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{thread.title}</h3>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {initialQuery && !results.blogs?.length && !results.users?.length && !results.communities?.length && !results.threads?.length && !loading && (
                <div className="text-center py-12 text-gray-500">No results found.</div>
            )}
        </div>
    );
};
