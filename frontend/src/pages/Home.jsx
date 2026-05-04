import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { BlogList } from '../components/blog/BlogList';
import { SuggestedUsers } from '../components/profile/SuggestedUsers';
import { useAuth } from '../context/AuthContext';
import { blogService } from '../services/blogService';
import { dailyThoughts } from '../data/dailyThoughts';

export const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('published');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dailyThought, setDailyThought] = useState('');

  useEffect(() => {
    blogService.getCategories().then(setCategories).catch(console.error);
    setDailyThought(dailyThoughts[Math.floor(Math.random() * dailyThoughts.length)]);
  }, []);

  return (
    <div className="space-y-8">
      <section>
        <div className="hero-panel overflow-hidden px-4 py-4 md:px-5 md:py-4.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--outline)] bg-[var(--surface-soft)] px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-[var(--primary)] shadow-sm">
            <Sparkles className="h-3 w-3 text-[var(--highlight)]" />
            Daily Thought
          </div>
          <blockquote className="mt-2.5 max-w-lg text-lg font-semibold tracking-tight text-[var(--text)] md:text-[1.45rem]">
            "{dailyThought}"
          </blockquote>
          <p className="mt-2.5 max-w-md text-[13px] leading-5 text-[var(--text-muted)]">
            Explore fresh writing, follow people worth learning from, and pick up where you left off.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="rounded-lg bg-[var(--primary)] px-3.5 py-2 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-90">
              {isAuthenticated ? 'Open dashboard' : 'Create account'}
            </Link>
            <Link to="/leaderboards" className="rounded-lg border border-[var(--outline)] bg-[var(--surface-soft)] px-3.5 py-2 text-sm text-[var(--text)] transition hover:opacity-90">
              View leaderboards
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-6">
          <div className="panel p-4">
            <div className="flex flex-wrap items-center gap-3">
              {[
                { id: 'published', label: 'Latest' },
                { id: 'trending', label: 'Trending' },
                ...(user ? [{ id: 'following', label: 'Following' }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-4 py-2 text-sm transition ${activeTab === tab.id ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'bg-[var(--surface-soft)] text-[var(--text-muted)] hover:opacity-90'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="panel p-6">
            <BlogList type={activeTab} categoryId={selectedCategory} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text)]">Filter by category</h2>
            <select
              value={selectedCategory || ''}
              onChange={(event) => setSelectedCategory(event.target.value || null)}
              className="mt-4 w-full rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
            >
              <option value="">All Topics</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {user ? (
            <SuggestedUsers />
          ) : (
            <div className="panel p-6">
              <h2 className="text-lg font-semibold text-[var(--text)]">Join the creator side</h2>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Follow authors, save posts, unlock notifications, and use the new AI and analytics tools.
              </p>
              <Link to="/signup" className="mt-5 inline-flex rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-contrast)] hover:opacity-90">
                Get started
              </Link>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};
