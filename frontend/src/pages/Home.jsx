import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';
import { blogService } from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Users, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Home = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);

  const selectedCategory = searchParams.get('category');
  const feedType = searchParams.get('feed') || 'latest';

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    loadSuggestedUsers();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await blogService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const loadSuggestedUsers = async () => {
    try {
      const { userService } = await import('../services/userService');
      const users = await userService.searchUsers("");
      const filteredUsers = users
        .filter(u => u.id !== user?.id)
        .slice(0, 10); // Get top 10 for view all
      setSuggestedUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load suggested users', error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const { followService } = await import('../services/followService');
      await followService.followUser(userId);
      toast.success('User followed!');
      setSuggestedUsers(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: true } : u));
    } catch (error) {
      toast.error('Failed to follow user');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* Main Feed Area */}
      <div className="lg:col-span-8">
        {/* Featured / Welcome Section (Optional, mimicking "Ann Monson" card style if needed, or just Feed Header) */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Home</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Your personal feed</p>
          </div>
          {/* Filter Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setSearchParams({ feed: 'latest' })}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${feedType === 'latest' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              For You
            </button>
            <button
              onClick={() => {
                if (!user) {
                  toast.error('Please login to view your following feed');
                  return;
                }
                setSearchParams({ feed: 'following' });
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${feedType === 'following' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Following
            </button>
          </div>
        </div>

        {/* Show login prompt if trying to access Following without authentication */}
        {feedType === 'following' && !user ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to be logged in to view your personalized following feed.
              </p>
              <div className="flex gap-4 justify-center">
                <Link 
                  to="/login" 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <BlogList 
            type={selectedCategory ? 'category' : (feedType === 'following' ? 'feed' : 'published')} 
            categoryId={selectedCategory}
          />
        )}
      </div>

      {/* Right Sidebar Widgets */}
      <div className="hidden lg:block lg:col-span-4 space-y-6">

        {/* Trending Categories Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Trending Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 6).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSearchParams({ category: cat.id })}
                className="px-3 py-1 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium transition-colors border border-gray-100 dark:border-gray-600"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Who to Follow Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Who to Follow
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-blue-500 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-4">
            {suggestedUsers.slice(0, 3).map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <Link to={`/profile/${u.username}`} className="flex items-center gap-3">
                  {u.profileImageUrl ? (
                    <img src={u.profileImageUrl} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                      {u.username?.[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-[100px]">{u.firstName || u.username}</h4>
                    <p className="text-[10px] text-gray-500">@{u.username}</p>
                  </div>
                </Link>
                <button
                  onClick={() => handleFollow(u.id)}
                  disabled={u.isFollowing}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${u.isFollowing
                    ? 'bg-gray-100 text-gray-400 border-gray-200'
                    : 'text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'
                    }`}
                >
                  {u.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
            {suggestedUsers.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">No users to follow</p>
            )}
          </div>
        </div>

        {/* View All Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold dark:text-white">People to Follow</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <ChevronRight className="w-6 h-6 rotate-90" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {suggestedUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                    <Link to={`/profile/${u.username}`} className="flex items-center gap-4 flex-1">
                      {u.profileImageUrl ? (
                        <img src={u.profileImageUrl} alt={u.username} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                          {u.username?.[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{u.firstName} {u.lastName}</h4>
                        <p className="text-sm text-gray-500">@{u.username}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleFollow(u.id)}
                      disabled={u.isFollowing}
                      className={`px-6 py-2 rounded-full text-sm font-bold shadow-sm transition-all ${u.isFollowing
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                        }`}
                    >
                      {u.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
