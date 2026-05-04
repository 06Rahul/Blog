import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import { ProfileEdit } from './ProfileEdit';
import { getImageUrl } from '../../utils/imageUrl';
import { savedBlogService } from '../../services/savedBlogService';
import { communityService } from '../../services/communityService';
import { BlogList } from '../blog/BlogList';
import { Link } from 'react-router-dom';
import { FollowListModal } from './FollowListModal';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [usage, setUsage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('blogs');
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [modal, setModal] = useState({ open: false, type: 'followers' });

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const usageData = await aiService.getUsage();
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    await updateUser();
    setEditing(false);
    await loadUsage();
  };

  useEffect(() => {
    if (!user) return;

    if (activeTab === 'bookmarks') {
      savedBlogService.getSavedBlogs(0, 20)
        .then((data) => setSavedBlogs(data.content || []))
        .catch((error) => console.error('Failed to load saved blogs', error));
    }

    if (activeTab === 'communities') {
      communityService.getAllCommunities(0, 20, '', '', true)
        .then((data) => setCommunities(data.content || []))
        .catch((error) => console.error('Failed to load communities', error));
    }
  }, [activeTab, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (editing) {
    return <ProfileEdit onCancel={() => setEditing(false)} onSave={handleProfileUpdate} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-indigo-700"></div>
        <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
                <div className="flex items-end gap-6">
                    {user?.profileImageUrl ? (
                    <img
                        src={getImageUrl(user.profileImageUrl)}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/128';
                        }}
                    />
                    ) : (
                    <div className="w-32 h-32 rounded-full bg-primary-200 flex items-center justify-center text-4xl font-bold text-primary-600 border-4 border-white shadow-lg">
                        {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                    </div>
                    )}
                    <div className="pb-2">
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                            {user?.firstName} {user?.lastName}
                        </h1>
                        <p className="text-gray-500 font-medium">@{user?.username}</p>
                    </div>
                </div>
                <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-2 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
                >
                    Edit Profile
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    {user?.bio && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bio</h3>
                            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button 
                            onClick={() => setModal({ open: true, type: 'followers' })}
                            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-center border border-gray-100"
                        >
                            <div className="text-2xl font-bold text-primary-600">{user?.followerCount || 0}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Followers</div>
                        </button>
                        <button 
                            onClick={() => setModal({ open: true, type: 'following' })}
                            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-center border border-gray-100"
                        >
                            <div className="text-2xl font-bold text-primary-600">{user?.followingCount || 0}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Following</div>
                        </button>
                        <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                            <div className="text-2xl font-bold text-primary-600">{user?.role}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Role</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                             <div className={`text-sm font-bold ${user?.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                {user?.emailVerified ? 'VERIFIED' : 'PENDING'}
                             </div>
                             <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Email Status</div>
                        </div>
                    </div>

                    {usage && (
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900">AI Assistant Usage</h3>
                                <span className="text-sm font-bold text-gray-500">{usage.used} / {usage.limit} requests</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-primary-600 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10">
                <div className="flex gap-8 border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('blogs')}
                        className={`pb-4 px-1 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'blogs' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        My Blogs
                        {activeTab === 'blogs' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('bookmarks')}
                        className={`pb-4 px-1 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'bookmarks' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Bookmarked
                        {activeTab === 'bookmarks' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('communities')}
                        className={`pb-4 px-1 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'communities' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Communities
                        {activeTab === 'communities' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />}
                    </button>
                </div>

                <div className="min-h-[200px] animate-in fade-in duration-300">
                    {activeTab === 'blogs' && <BlogList type="my-published" />}

                    {activeTab === 'bookmarks' && (
                        <div className="grid grid-cols-1 gap-4">
                        {savedBlogs.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500 font-medium">No bookmarked blogs yet.</p>
                            </div>
                        ) : (
                            savedBlogs.map((blog) => (
                            <Link key={blog.id} to={`/blogs/${blog.id}`} className="block bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-primary-100 transition-all group">
                                <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-lg mb-2">{blog.title}</div>
                                {blog.summary && <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{blog.summary}</div>}
                            </Link>
                            ))
                        )}
                        </div>
                    )}

                    {activeTab === 'communities' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {communities.length === 0 ? (
                            <div className="col-span-2 text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500 font-medium">You have not joined any communities yet.</p>
                            </div>
                        ) : (
                            communities.map((community) => (
                            <Link key={community.id} to={`/communities/${community.id}`} className="block bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-primary-100 transition-all">
                                <div className="font-bold text-gray-900 text-lg mb-2">{community.name}</div>
                                {community.description && <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{community.description}</div>}
                            </Link>
                            ))
                        )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <FollowListModal
          isOpen={modal.open}
          onClose={() => setModal((prev) => ({ ...prev, open: false }))}
          type={modal.type}
          userId={user?.id}
      />
    </div>
  );
};
