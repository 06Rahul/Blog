import { useEffect, useState } from 'react';
import { BarChart3, Eye, TrendingUp, Coins, Percent, ArrowRightLeft } from 'lucide-react';
import { featureHubService } from '../services/featureHubService';

export const AnalyticsDashboardPage = () => {
  const [data, setData] = useState({ overview: null, postAnalytics: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await featureHubService.getAnalyticsDashboard();
        setData(response);
      } catch (err) {
        console.error('Analytics dashboard failed', err);
        setError('Analytics are unavailable right now.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const overview = data.overview;

  const postAnalytics = data.postAnalytics;

  return (
    <div className="space-y-8">
      <section className="panel p-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </div>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">Exact backend analytics wiring</h1>
          <p className="max-w-3xl text-sm text-slate-300 md:text-base">
            This view now consumes `/api/users/me/analytics` and, when available, `/api/blogs/:id/analytics` for the current top post.
          </p>
        </div>
      </section>

      {loading && <section className="panel p-6 text-sm text-slate-400">Loading analytics...</section>}
      {error && !loading && <section className="panel p-6 text-sm text-amber-200">{error}</section>}

      {!loading && !error && overview && <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Total views', value: overview.totalViews, icon: Eye },
          { label: 'Unique readers', value: overview.totalUniqueReaders, icon: TrendingUp },
          { label: 'Total kudos', value: overview.totalKudosEarned, icon: Coins },
          { label: 'Est. earnings', value: `$${Number(overview.estimatedEarnings || 0).toFixed(2)}`, icon: ArrowRightLeft },
          { label: 'Avg completion', value: `${Number(overview.avgReadCompletionRate || 0).toFixed(1)}%`, icon: Percent },
        ].map((item) => (
          <article key={item.label} className="panel p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
              </div>
              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
                <item.icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        ))}
      </section>}

      {!loading && !error && overview && <section className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <article className="panel p-6">
          <h2 className="text-lg font-semibold text-white">Top post from aggregate analytics</h2>
          {overview.topPost ? (
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Top Post</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{overview.topPost.title}</h3>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
                <span>{overview.topPost.views} views</span>
                {overview.topPost.id && <span className="text-slate-500">ID: {String(overview.topPost.id).slice(0, 8)}...</span>}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No top post available in the aggregate response.</p>
          )}
        </article>

        <article className="panel overflow-hidden">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-lg font-semibold text-white">Top post detailed analytics</h2>
          </div>
          {postAnalytics ? (
            <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.2fr]">
              <div className="space-y-4">
                {[
                  { label: 'Post views', value: postAnalytics.totalViews },
                  { label: 'Unique readers', value: postAnalytics.uniqueReaders },
                  { label: 'Completion rate', value: `${Number(postAnalytics.avgCompletionPct || 0).toFixed(1)}%` },
                  { label: 'Likes', value: postAnalytics.likeCount },
                  { label: 'Comments', value: postAnalytics.commentCount },
                  { label: 'Tips', value: postAnalytics.tipCount },
                  { label: 'Kudos', value: postAnalytics.totalKudos },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Weekly trend</h3>
                  <div className="mt-4 grid grid-cols-7 gap-2">
                    {postAnalytics.weeklyTrend?.map((point) => (
                      <div key={point.day} className="rounded-2xl bg-white/5 p-3 text-center">
                        <p className="text-xs text-slate-500">{point.day}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{point.views}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Top referrers</h3>
                  <div className="mt-4 space-y-3">
                    {postAnalytics.topReferrers?.map((referrer) => (
                      <div key={referrer.referrer} className="rounded-2xl bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-300">{referrer.referrer}</span>
                          <span className="font-semibold text-white">{referrer.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-sm text-slate-400">Per-post analytics are only shown when the aggregate response includes a `topPost.id`.</div>
          )}
        </article>
      </section>}
    </div>
  );
};
