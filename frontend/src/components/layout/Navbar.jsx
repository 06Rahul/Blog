import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Blog Platform
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/blogs/new"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    New Blog
                  </Link>
                  <Link
                    to="/ai"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    AI Assistant
                  </Link>
                </>
              )}
              <Link
                to="/search"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                Search
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600"
                >
                  {user?.profileImageUrl ? (
                    <img
                      src={`http://localhost:8080/${user.profileImageUrl}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/32';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 font-bold">
                      {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                    </div>
                  )}
                  <span>{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
