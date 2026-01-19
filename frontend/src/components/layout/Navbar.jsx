import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationDropdown } from '../notification/NotificationDropdown';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Search', path: '/search' },
    ...(isAuthenticated ? [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Write', path: '/blogs/new' },
      { name: 'Profile', path: '/profile' }
    ] : [])
  ];

  return (
    <header className="bg-white border-b border-gray-100 py-4 md:py-8 sticky top-0 z-50 bg-blue-50">
      <div className="max-w-7xl mx-auto px-6 relative">

        {/* Desktop Header */}
        <div className="flex flex-col items-center justify-center gap-6 md:gap-8">


          {/* Mobile Top Bar: Logo + Menu Toggle */}
          <div className="w-full flex justify-between items-center md:hidden">
            <Link to="/" className="text-2xl font-serif tracking-wide text-black">
              Blog Platform
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              <div className="space-y-1.5">
                <span className={`block w-6 h-0.5 bg-black transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-black transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-black transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>

          {/* Desktop Auth/Theme (Absolute Top Right) */}
          <div className="hidden md:flex absolute top-0 right-6 items-center gap-4 text-xs tracking-widest uppercase text-gray-400">
            <button onClick={toggleTheme} className="hover:text-black transition-colors">
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            {isAuthenticated ? (
              <>
                <span>{user?.firstName || 'User'}</span>
                <button onClick={handleLogout} className="hover:text-black transition-colors">Logout</button>
                <NotificationDropdown />
              </>
            ) : (
              <Link to="/login" className="hover:text-black transition-colors">Login</Link>
            )}
          </div>

          {/* Desktop Logo */}
          <Link to="/" className="hidden md:block text-5xl font-serif tracking-wide text-black hover:text-gray-700 transition-colors">
            Blog Platform
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-12 text-sm tracking-[0.2em] font-medium text-gray-500 uppercase">
            {navLinks.map(link => (
              <Link key={link.name} to={link.path} className="hover:text-black transition-colors">{link.name}</Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 py-6 px-6 flex flex-col gap-6 shadow-lg">
            <nav className="flex flex-col gap-4 text-sm tracking-[0.2em] font-medium text-gray-500 uppercase">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-black transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-100 pt-6 flex flex-col gap-4 text-xs tracking-widest uppercase text-gray-400">
              <div className="flex justify-between items-center">
                <span>Theme</span>
                <button onClick={toggleTheme} className="text-black">
                  {theme === 'light' ? 'Dark' : 'Light'}
                </button>
              </div>
              {isAuthenticated ? (
                <>
                  <div className="flex justify-between items-center">
                    <span>Account</span>
                    <span>{user?.firstName}</span>
                  </div>
                  <button onClick={handleLogout} className="text-left hover:text-black text-red-400">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="hover:text-black transition-colors">Login</Link>
              )}
            </div>
          </div>
        )}

      </div >
    </header >
  );
};
