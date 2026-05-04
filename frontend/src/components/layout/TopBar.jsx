import { Menu, Moon, Search, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationDropdown } from '../notification/NotificationDropdown';
import { getImageUrl } from '../../utils/imageUrl';

export const TopBar = ({ setMobileNavOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="shell-chrome sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <button className="shell-soft rounded-2xl border p-3 text-[var(--text)] hover:opacity-90 lg:hidden" onClick={() => setMobileNavOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search posts, people, communities, tags..."
              className="shell-input w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--primary)]"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-3">
          <button onClick={toggleTheme} className="shell-soft rounded-2xl border p-3 text-[var(--text)] hover:opacity-90" title="Quick theme toggle">
            {theme === 'default' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/blogs/new" className="hidden rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-90 sm:inline-flex">
                Create
              </Link>
              <NotificationDropdown />
              <Link to="/profile" className="shell-soft hidden items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm text-[var(--text)] hover:opacity-90 sm:flex">
                {user?.profileImageUrl ? (
                  <img src={getImageUrl(user.profileImageUrl)} alt="Profile" className="h-9 w-9 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold text-[var(--text)]" style={{ backgroundColor: 'var(--primary-soft)' }}>
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="leading-tight">
                  <p className="font-medium text-[var(--text)]">{user?.firstName || user?.username}</p>
                  <p className="text-xs text-[var(--text-muted)]">@{user?.username}</p>
                </div>
              </Link>
              <button onClick={handleLogout} className="shell-soft rounded-2xl border px-4 py-3 text-sm text-[var(--text)] hover:opacity-90">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="shell-soft rounded-2xl border px-4 py-3 text-sm text-[var(--text)] hover:opacity-90">
                Login
              </Link>
              <Link to="/signup" className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-90">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
