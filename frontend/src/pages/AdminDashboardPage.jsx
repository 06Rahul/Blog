import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Users, FileWarning, Ban, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { featureHubService } from '../services/featureHubService';

const toneClasses = {
  sky: 'from-sky-400/20 to-sky-400/5 text-sky-100',
  amber: 'from-amber-400/20 to-amber-400/5 text-amber-100',
  emerald: 'from-emerald-400/20 to-emerald-400/5 text-emerald-100',
  rose: 'from-rose-400/20 to-rose-400/5 text-rose-100',
};

const severityClasses = {
  high: 'bg-rose-500/15 text-rose-200',
  medium: 'bg-amber-500/15 text-amber-200',
  low: 'bg-slate-500/15 text-slate-200',
};

export const AdminDashboardPage = () => {
  const [tab, setTab] = useState('reports');
  const [data, setData] = useState({ stats: [], reports: [], accounts: [], contentQueue: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await featureHubService.getAdminDashboard();
        setData(response);
      } catch (err) {
        console.error('Admin dashboard failed', err);
        setError('Admin data is unavailable right now.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <section className="panel p-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">
            <Shield className="h-3.5 w-3.5" />
            Admin Dashboard
          </div>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">Reports and moderation from real endpoints</h1>
          <p className="max-w-3xl text-sm text-slate-300 md:text-base">
            Reports are sourced from `/api/reports` and rejected content comes from `/api/admin/moderation`. Suspicious accounts still use placeholder UI because the backend route does not exist yet.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <article key={stat.label} className={`rounded-[28px] border border-white/10 bg-gradient-to-br p-5 ${toneClasses[stat.tone] || toneClasses.sky}`}>
            <p className="text-sm text-slate-300">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="text-3xl font-semibold text-white">{stat.value}</div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs">{stat.change}</div>
            </div>
          </article>
        ))}
      </section>

      {loading && <section className="panel p-6 text-sm text-slate-400">Loading moderation data...</section>}
      {error && !loading && <section className="panel p-6 text-sm text-amber-200">{error}</section>}

      <section className="panel p-3">
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'reports', label: 'Reports' },
            { id: 'accounts', label: 'Accounts' },
            { id: 'content', label: 'Content' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-2xl px-4 py-2 text-sm transition ${tab === item.id ? 'bg-cyan-400 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {!loading && !error && tab === 'reports' && (
        <section className="space-y-4">
          {data.reports.length === 0 && <article className="panel p-6 text-sm text-slate-400">No pending reports found.</article>}
          {data.reports.map((report) => (
            <article key={report.id} className="panel p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <FileWarning className="h-5 w-5 text-rose-300" />
                    <h2 className="text-lg font-semibold text-white">{report.type}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs ${severityClasses[report.severity] || severityClasses.low}`}>{report.severity}</span>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">{report.status}</span>
                  </div>
                  <p className="text-sm text-slate-300">{report.subject}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>{report.reportedBy}</span>
                    <span className="text-slate-600">|</span>
                    <span>{report.timestamp ? formatDistanceToNow(new Date(report.timestamp), { addSuffix: true }) : 'Recently'}</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                  Item: {String(report.reportedItemId).slice(0, 8)}...
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && !error && tab === 'accounts' && (
        <section className="grid gap-4 xl:grid-cols-3">
          <article className="panel p-6">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-white">Accounts endpoint missing</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Dummy account cards were removed. Add a backend suspicious-account endpoint before this section can show data.
            </p>
          </article>
        </section>
      )}

      {!loading && !error && tab === 'content' && (
        <section className="grid gap-4 md:grid-cols-2">
          {data.contentQueue.length === 0 && <article className="panel p-6 text-sm text-slate-400">No rejected content in the moderation queue.</article>}
          {data.contentQueue.map((item) => (
            <article key={item.id} className="panel p-5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-white">{item.label}</h2>
                  <p className="mt-1 text-sm text-slate-400">{item.kind} | {item.state}</p>
                  <p className="mt-3 text-sm text-slate-300">{item.reason}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span>ID: {String(item.contentId).slice(0, 8)}...</span>
                {item.createdAt && <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>}
              </div>
            </article>
          ))}
          <article className="panel p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <div>
                <h2 className="text-base font-semibold text-white">Moderation overrides exist server-side</h2>
                <p className="mt-1 text-sm text-slate-400">
                  The backend exposes override endpoints for posts and comments under `/api/admin/moderation/.../override`.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Ban className="h-4 w-4" />
              UI actions can be added directly against those endpoints next.
            </div>
          </article>
        </section>
      )}
    </div>
  );
};
