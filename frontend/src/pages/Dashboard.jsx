import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PenSquare, Bell, BarChart3 } from 'lucide-react';
import { BlogList } from '../components/blog/BlogList';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('published');

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="panel p-8">
          <h1 className="text-3xl font-semibold text-[var(--text)] md:text-4xl">Your creator workspace</h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
            Manage published posts, drafts, notifications, and performance from one dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/blogs/new" className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-90">
              Create new blog
            </Link>
            <Link to="/analytics/dashboard" className="rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] px-5 py-3 text-sm text-[var(--text)] transition hover:opacity-90">
              Open analytics
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {[
            { icon: FileText, value: 'Published', label: 'Live posts' },
            { icon: PenSquare, value: 'Drafts', label: 'Work in progress' },
            { icon: Bell, value: 'Inbox', label: 'Unread updates' },
            { icon: BarChart3, value: 'Metrics', label: 'Growth signals' },
          ].map((card) => (
            <article key={card.label} className="panel p-5">
              <div className="w-fit rounded-2xl bg-[var(--surface-muted)] p-3 text-[var(--primary)]">
                <card.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xl font-semibold text-[var(--text)]">{card.value}</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{card.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-4">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { id: 'published', label: 'Published' },
            { id: 'drafts', label: 'Drafts' },
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
      </section>

      <section className="panel p-6">
        <BlogList type={activeTab === 'published' ? 'my-published' : 'drafts'} />
      </section>
    </div>
  );
};
