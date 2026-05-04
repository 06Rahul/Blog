import { Medal, Trophy, Users, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { discoveryService } from '../services/discoveryService';

export const LeaderboardsPage = () => {
  const [window, setWindow] = useState('week');
  const [tab, setTab] = useState('creators');
  const [data, setData] = useState({ creators: [], communities: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [creators, communities, posts] = await Promise.all([
          discoveryService.getCreatorLeaderboard(window, 10),
          discoveryService.getCommunityLeaderboard(window, 10),
          discoveryService.getPostLeaderboard(window, 10),
        ]);
        setData({ creators, communities, posts });
      } catch (err) {
        console.error('Failed to load leaderboards', err);
        setError('Leaderboards are unavailable right now.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [window]);

  return (
    <div className="space-y-8">
      <section className="hero-panel p-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--outline)] bg-[var(--surface-soft)] px-3 py-1 text-xs uppercase tracking-[0.28em] text-[var(--primary)]">
            <Medal className="h-3.5 w-3.5" />
            Leaderboards
          </div>
          <h1 className="text-3xl font-semibold text-[var(--text)] md:text-4xl">Top creators, communities, and posts</h1>
          <p className="max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
            Rankings now use weighted engagement signals and support time-based windows so newer high-quality content can surface.
          </p>
        </div>
      </section>

      <section className="panel p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'creators', label: 'Creators', icon: Trophy },
              { id: 'communities', label: 'Communities', icon: Users },
              { id: 'posts', label: 'Posts', icon: FileText },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm transition ${tab === item.id ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'bg-[var(--surface-soft)] text-[var(--text)] hover:opacity-90'}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {['today', 'week', 'month', 'all-time'].map((item) => (
              <button
                key={item}
                onClick={() => setWindow(item)}
                className={`rounded-xl px-3 py-2 text-sm transition ${window === item ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'bg-[var(--surface-soft)] text-[var(--text-muted)] hover:opacity-90'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-[var(--text-muted)]">Loading leaderboard data...</div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">{error}</div>
        ) : (
          <div className="mt-6 space-y-4">
            {tab === 'creators' && data.creators.map((entry, index) => (
              <div key={entry.userId} className="rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">#{index + 1}</div>
                    <div className="mt-2 text-lg font-semibold text-[var(--text)]">{entry.displayName}</div>
                    <div className="text-sm text-[var(--text-muted)]">@{entry.username}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Score</div>
                    <div className="mt-1 text-2xl font-semibold text-[var(--text)]">{Math.round(entry.score)}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-5">
                  <div>Views: <span className="text-[var(--text)]">{entry.postViews}</span></div>
                  <div>Reads: <span className="text-[var(--text)]">{entry.completedReads}</span></div>
                  <div>Likes: <span className="text-[var(--text)]">{entry.likesReceived}</span></div>
                  <div>Comments: <span className="text-[var(--text)]">{entry.commentsReceived}</span></div>
                  <div>Follows: <span className="text-[var(--text)]">{entry.followersGained}</span></div>
                </div>
              </div>
            ))}

            {tab === 'communities' && data.communities.map((entry, index) => (
              <div key={entry.communityId} className="rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">#{index + 1}</div>
                    <div className="mt-2 text-lg font-semibold text-[var(--text)]">{entry.name}</div>
                    <div className="text-sm text-[var(--text-muted)]">Owner @{entry.ownerUsername}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Score</div>
                    <div className="mt-1 text-2xl font-semibold text-[var(--text)]">{Math.round(entry.score)}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-4">
                  <div>Members: <span className="text-[var(--text)]">{entry.memberCount}</span></div>
                  <div>Joins: <span className="text-[var(--text)]">{entry.joins}</span></div>
                  <div>Threads: <span className="text-[var(--text)]">{entry.newThreads}</span></div>
                  <div>Replies: <span className="text-[var(--text)]">{entry.replies}</span></div>
                </div>
              </div>
            ))}

            {tab === 'posts' && data.posts.map((entry, index) => (
              <Link key={entry.post.id} to={`/blogs/${entry.post.id}`} className="block rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] p-5 transition hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">#{index + 1}</div>
                    <div className="mt-2 text-lg font-semibold text-[var(--text)]">{entry.post.title}</div>
                    <div className="text-sm text-[var(--text-muted)]">By @{entry.post.authorUsername}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Score</div>
                    <div className="mt-1 text-2xl font-semibold text-[var(--text)]">{Math.round(entry.score)}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-5">
                  <div>Views: <span className="text-[var(--text)]">{entry.views}</span></div>
                  <div>Reads: <span className="text-[var(--text)]">{entry.completedReads}</span></div>
                  <div>Likes: <span className="text-[var(--text)]">{entry.likes}</span></div>
                  <div>Comments: <span className="text-[var(--text)]">{entry.comments}</span></div>
                  <div>Saves: <span className="text-[var(--text)]">{entry.saves}</span></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
