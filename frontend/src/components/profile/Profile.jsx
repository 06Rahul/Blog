import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { aiService } from '../../services/aiService';
import { ProfileEdit } from './ProfileEdit';
import { FollowListModal } from './FollowListModal';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [usage, setUsage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [postCount, setPostCount] = useState(0);
  const [modal, setModal] = useState({ open: false, type: 'followers' });

  useEffect(() => {
    loadUsage();
    if (user) {
      loadCounts();
      loadPostCount();
    }
  }, [user]);

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

  const loadCounts = async () => {
    try {
      const { followService } = await import('../../services/followService');
      const [followers, following] = await Promise.all([
        followService.getFollowerCount(user.id),
        followService.getFollowingCount(user.id)
      ]);
      setCounts({ followers, following });
    } catch (error) {
      console.error(error);
    }
  };

  const loadPostCount = async () => {
    try {
      const { blogService } = await import('../../services/blogService');
      const data = await blogService.searchByAuthor(user.username, 0, 1);
      setPostCount(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to load post count', error);
    }
  };

  const handleProfileUpdate = async () => {
    await updateUser();
    setEditing(false);
    await loadUsage();
  };

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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif tracking-wide text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-500 font-serif italic">Manage your blogging profile and personal information</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-8 py-3 bg-[#e4dfef] hover:bg-[#d4cfe0] text-gray-900 text-xs font-bold tracking-widest uppercase rounded-none transition-all shadow-sm hover:shadow-md"
          >
            Edit Profile
          </button>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white border border-gray-100 p-12 mb-12 shadow-sm">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-40 h-40 object-cover border border-gray-100 shadow-sm mb-6 rounded-full"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-50 flex items-center justify-center text-5xl font-serif text-gray-300 mb-6 border border-gray-100 rounded-full">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </div>
              )}
              <div className="flex flex-wrap gap-2 justify-center">
                {!user?.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 border border-yellow-200 bg-yellow-50 text-yellow-700 text-xxs font-bold uppercase tracking-wider">
                    Pending
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1 border border-[#d4cfe0] bg-[#e4dfef] text-gray-800 text-xxs font-bold uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 w-full">
              <h2 className="text-4xl font-serif text-gray-900 mb-2">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-400 font-serif italic text-lg mb-8">@{user?.username}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm text-gray-500 tracking-wide">
                <div className="flex items-center gap-3">
                  <span className="uppercase text-xs font-bold text-gray-300 w-16">Email</span>
                  <span className="text-gray-900">{user?.email}</span>
                </div>
                {user?.mobileNumber && (
                  <div className="flex items-center gap-3">
                    <span className="uppercase text-xs font-bold text-gray-300 w-16">Phone</span>
                    <span className="text-gray-900">{user.mobileNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="uppercase text-xs font-bold text-gray-300 w-16">Joined</span>
                  <span className="text-gray-900">{memberSince}</span>
                </div>
              </div>

              {user?.bio && (
                <div className="bg-[#fcfcff] p-6 border-l-2 border-[#e4dfef] italic text-gray-600 font-serif leading-relaxed mb-8">
                  "{user.bio}"
                </div>
              )}

              {/* Stats Section */}
              <div className="flex gap-12 border-t border-gray-100 pt-8">
                <button
                  onClick={() => setModal({ open: true, type: 'followers' })}
                  className="text-center group hover:opacity-70 transition-opacity"
                >
                  <span className="block text-3xl font-serif text-gray-900 mb-1 group-hover:text-[#9f96b8] transition-colors">{counts.followers}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Followers</span>
                </button>
                <button
                  onClick={() => setModal({ open: true, type: 'following' })}
                  className="text-center group hover:opacity-70 transition-opacity"
                >
                  <span className="block text-3xl font-serif text-gray-900 mb-1 group-hover:text-[#9f96b8] transition-colors">{counts.following}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Following</span>
                </button>
                <div className="text-center">
                  <span className="block text-3xl font-serif text-gray-900 mb-1">{postCount}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Posts</span>
                </div>
              </div>

              {/* Modal */}
              <FollowListModal
                isOpen={modal.open}
                onClose={() => setModal(prev => ({ ...prev, open: false }))}
                type={modal.type}
                userId={user?.id}
              />

            </div>
          </div>
        </div>

        {/* Website Section */}
        {user?.website && (
          <div className="bg-white border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-1">Website</h3>
                <a
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-gray-500 hover:text-[#9f96b8] transition-colors italic"
                >
                  {user.website}
                </a>
              </div>
            </div>
            <a
              href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-[#e4dfef] hover:border-[#e4dfef] hover:text-black transition-colors"
            >
              Visit Site
            </a>
          </div>
        )}

        {/* AI Usage Stats */}
        {usage && (
          <div className="bg-white border border-gray-100 p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-violet-500 border border-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-1">AI Usage</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif text-gray-900">{usage.used}</span>
                    <span className="text-sm text-gray-400 font-serif italic">/ {usage.limit} requests</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full max-w-md">
                <div className="flex justify-between text-xxs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  <span>Daily Limit</span>
                  <span>{Math.round((usage.used / usage.limit) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5">
                  <div
                    className="bg-[#e4dfef] h-1.5 transition-all duration-1000"
                    style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xxs text-gray-300 uppercase tracking-wider mt-2 text-right">Resets daily at midnight UTC</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
