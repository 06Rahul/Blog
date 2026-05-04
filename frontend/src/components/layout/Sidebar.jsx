import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Bookmark, MessageSquare, Users, TrendingUp, Bell, BarChart3, Sparkles, Code2, Trophy, Shield, PlusSquare, X, UserCircle2, Palette } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const mainNav = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/search' },
  { icon: Bookmark, label: 'Dashboard', path: '/dashboard', auth: true },
  { icon: Bell, label: 'Notifications', path: '/notifications', auth: true },
  { icon: MessageSquare, label: 'Messages', path: '/messages', auth: true },
  { icon: UserCircle2, label: 'My Profile', path: '/profile', auth: true },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: TrendingUp, label: 'Trending', path: '/leaderboards' },
];

const toolNav = [
  { icon: BarChart3, label: 'Analytics', path: '/analytics/dashboard', auth: true },
  { icon: Sparkles, label: 'AI Assistant', path: '/ai-assistant', auth: true },
  { icon: Code2, label: 'Playground', path: '/playground', auth: true },
  { icon: Trophy, label: 'Leaderboards', path: '/leaderboards' },
];

const adminNav = [{ icon: Shield, label: 'Admin Dashboard', path: '/admin/dashboard', auth: true }];

export const SideBar = ({ mobileNavOpen, setMobileNavOpen }) => {
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { theme, themes, setTheme } = useTheme();
  const [showCustomizer, setShowCustomizer] = useState(false);

  const renderLink = (item) => {
    if (item.auth && !isAuthenticated) return null;
    const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
    return (
      <Link
        key={item.label}
        to={item.path}
        onClick={() => setMobileNavOpen(false)}
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${active ? 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-[0_20px_60px_-30px_rgba(15,23,42,0.22)]' : 'text-[var(--text)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]'}`}
      >
        <item.icon className="h-4.5 w-4.5" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition lg:hidden ${mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setMobileNavOpen(false)} />
      <aside className={`shell-chrome fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden border-r p-5 backdrop-blur-xl transition-transform duration-200 lg:w-80 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={() => setMobileNavOpen(false)}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-amber-300 text-lg font-semibold text-slate-950">U</div>
            <div>
              <div className="text-sm uppercase tracking-[0.28em] text-[var(--text-muted)]">UserService</div>
              <div className="text-lg font-semibold text-[var(--text)]">Creator Control</div>
            </div>
          </Link>
          <button className="rounded-xl p-2 text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] lg:hidden" onClick={() => setMobileNavOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shell-soft mt-5 rounded-[22px] border p-3">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Overview</p>
          <h2 className="mt-2 text-sm font-semibold leading-5 text-[var(--text)]">Publishing, analytics, moderation, and messaging in one place.</h2>
          {isAuthenticated ? (
            <Link to="/blogs/new" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-[11px] font-semibold text-[var(--primary-contrast)] transition hover:opacity-90">
              <PlusSquare className="h-3 w-3" />
              Create post
            </Link>
          ) : (
            <Link to="/signup" className="mt-3 inline-flex items-center rounded-lg bg-[var(--primary)] px-3 py-1.5 text-[11px] font-semibold text-[var(--primary-contrast)] transition hover:opacity-90">
              Join now
            </Link>
          )}
        </div>

        <nav className="mt-6 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1 pb-6">
          <div className="space-y-2">
            <p className="px-3 text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Main</p>
            {mainNav.map(renderLink)}
          </div>
          <div className="space-y-2">
            <p className="px-3 text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Tools</p>
            {toolNav.slice(0, 2).map(renderLink)}
            <div className="space-y-2">
              <button
                onClick={() => setShowCustomizer((current) => !current)}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-[var(--text)] transition hover:bg-[var(--surface-soft)]"
              >
                <Palette className="h-4.5 w-4.5 text-[var(--primary)]" />
                <span>Customize</span>
              </button>
              {showCustomizer && (
                <div className="grid gap-2 px-2 pb-2">
                  {themes.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`rounded-2xl border px-3 py-3 text-left text-sm transition ${theme === option.id ? 'border-[var(--primary)] bg-[var(--surface-muted)]' : 'border-[var(--outline)] bg-[var(--surface-soft)] hover:opacity-90'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-[var(--text)]">{option.name}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full border border-black/5" style={{ backgroundColor: option.palette['--primary'] }} />
                          <span className="h-2.5 w-2.5 rounded-full border border-black/5" style={{ backgroundColor: option.palette['--accent'] }} />
                          <span className="h-2.5 w-2.5 rounded-full border border-black/5" style={{ backgroundColor: option.palette['--secondary'] }} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {toolNav.slice(2).map(renderLink)}
          </div>
          {isAuthenticated && (
            <div className="space-y-2">
              <p className="px-3 text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Admin</p>
              {adminNav.map(renderLink)}
            </div>
          )}
        </nav>

        {isAuthenticated && (
          <div className="shell-soft mt-4 rounded-[24px] border p-4">
            <p className="text-sm font-medium text-[var(--text)]">{user?.firstName || user?.username}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">@{user?.username}</p>
          </div>
        )}
      </aside>
    </>
  );
};
