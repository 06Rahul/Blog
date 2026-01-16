import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';
import axios from 'axios';
import toast from 'react-hot-toast';

export const UserProfile = () => {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserProfile();
    }, [username]);

    const loadUserProfile = async () => {
        try {
            const response = await axios.get(`/api/users/username/${username}`);
            setUser(response.data);
        } catch (error) {
            toast.error('Failed to load user profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
                    <Link to="/" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
                        Go back home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <div className="flex items-start gap-6">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        {user.profileImageUrl ? (
                            <img
                                src={user.profileImageUrl}
                                alt={user.username}
                                className="w-24 h-24 rounded-full object-cover border-4 border-primary-600"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-primary-700"
                            style={{ display: user.profileImageUrl ? 'none' : 'flex' }}
                        >
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-xl text-gray-600 mb-4">@{user.username}</p>

                        {user.bio && (
                            <p className="text-gray-700 mb-4">{user.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {user.website && (
                                <a
                                    href={user.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-primary-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    {user.website}
                                </a>
                            )}
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* User's Blogs */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Blogs by {user.firstName}
                </h2>
                <BlogList type="author" username={user.username} />
            </div>
        </div>
    );
};
