import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { aiService } from '../../services/aiService';
import { ProfileEdit } from './ProfileEdit';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [usage, setUsage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Edit Profile
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {user?.profileImageUrl ? (
              <img
                src={`http://localhost:8080/${user.profileImageUrl}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary-200"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/128';
                }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary-200 flex items-center justify-center text-4xl font-bold text-primary-600">
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600">@{user?.username}</p>
              <p className="text-gray-600">{user?.email}</p>
            </div>

            {user?.bio && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Bio</h3>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.website && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Website</h3>
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {user.website}
                  </a>
                </div>
              )}

              {user?.mobileNumber && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Mobile</h3>
                  <p className="text-gray-700">{user.mobileNumber}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Role</h3>
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                  {user?.role}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Email Verified</h3>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.emailVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {user?.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>

            {usage && (
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">AI Usage Today</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Used: {usage.used}</p>
                    <p className="text-sm text-gray-600">Limit: {usage.limit}</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(usage.used / usage.limit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
