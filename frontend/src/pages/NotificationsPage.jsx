import { useEffect, useMemo, useState } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Trophy, Flame, CheckCheck, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../context/NotificationContext';
import { notificationService } from '../services/notificationService';

const typeConfig = {
  like: { icon: Heart, color: 'text-rose-400', chip: 'bg-rose-500/15 text-rose-200' },
  comment: { icon: MessageCircle, color: 'text-sky-400', chip: 'bg-sky-500/15 text-sky-200' },
  follow: { icon: UserPlus, color: 'text-emerald-400', chip: 'bg-emerald-500/15 text-emerald-200' },
  mention: { icon: AtSign, color: 'text-violet-400', chip: 'bg-violet-500/15 text-violet-200' },
  achievement: { icon: Trophy, color: 'text-amber-400', chip: 'bg-amber-500/15 text-amber-200' },
  trending: { icon: Flame, color: 'text-orange-400', chip: 'bg-orange-500/15 text-orange-200' },
};

export const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [grouped, setGrouped] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const { notifications, unreadCount, loading, error, refreshNotifications, markAllAsRead, markAsRead, dismissNotification } = useNotifications();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [groupedData, preferenceData] = await Promise.all([
          notificationService.getGroupedNotifications().catch(() => []),
          notificationService.getPreferences().catch(() => null),
        ]);
        setGrouped(Array.isArray(groupedData) ? groupedData : []);
        setPreferences(preferenceData);
      } catch (err) {
        console.error('Failed to load notification metadata', err);
      }
    };
    loadMeta();
  }, [notifications]);

  const filtered = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter((item) => !item.read);
    if (activeTab === 'mentions') return notifications.filter((item) => item.type === 'mention');
    return notifications;
  }, [activeTab, notifications]);

  const updatePreference = async (key, value) => {
    try {
      const next = await notificationService.updatePreferences({ [key]: value });
      setPreferences(next);
    } catch (err) {
      console.error('Failed to update notification preferences', err);
    }
  };

  return (
    <div className="space-y-8">
      <section className="panel p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--outline)] bg-[var(--surface-soft)] px-3 py-1 text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
              <Bell className="h-3.5 w-3.5" />
              Notifications
            </div>
            <h1 className="text-3xl font-semibold text-[var(--text)] md:text-4xl">Your activity inbox</h1>
            <p className="max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
              Likes, comments, follows, mentions, achievements, and trending signals in one queue.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)]">
              {unreadCount} unread
            </div>
            <button onClick={markAllAsRead} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-contrast)] transition hover:opacity-90">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          </div>
        </div>
      </section>

      <section className="panel p-3">
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'mentions', label: 'Mentions' },
            { id: 'grouped', label: 'Grouped' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-4 py-2 text-sm transition ${activeTab === tab.id ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'bg-[var(--surface-soft)] text-[var(--text)] hover:bg-[var(--surface-muted)]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {preferences && (
        <section className="panel p-6">
          <div className="flex flex-wrap items-center gap-3">
            {[
              ['likes', 'Likes'],
              ['comments', 'Comments'],
              ['follows', 'Follows'],
              ['mentions', 'Mentions'],
              ['messages', 'Messages'],
              ['community', 'Community'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => updatePreference(key, !preferences[key])}
                className={`rounded-full px-4 py-2 text-sm transition ${preferences[key] ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'bg-[var(--surface-soft)] text-[var(--text)] border border-[var(--outline)]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'grouped' && (
        <section className="space-y-4">
          {grouped.length === 0 ? (
            <article className="panel p-6 text-sm text-[var(--text-muted)]">No grouped notifications yet.</article>
          ) : grouped.map((group) => {
            const config = typeConfig[String(group.type || 'comment').toLowerCase()] || typeConfig.comment;
            const Icon = config.icon;
            return (
              <article key={group.groupKey} className={`panel p-5 ${group.read ? 'opacity-80' : 'ring-1 ring-[var(--primary)]/30'}`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-soft)] ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-semibold text-[var(--text)]">{group.title}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs ${config.chip}`}>{String(group.type).toLowerCase()}</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">{group.message}</p>
                    <div className="text-xs text-[var(--text-muted)]">
                      {group.latestCreatedAt ? formatDistanceToNow(new Date(group.latestCreatedAt), { addSuffix: true }) : 'Recently'}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {activeTab !== 'grouped' && (
      <section className="space-y-4">
        {loading && (
          <article className="panel p-6 text-sm text-[var(--text-muted)]">Loading notifications...</article>
        )}
        {error && !loading && (
          <article className="panel p-6 text-sm text-amber-600">{error}</article>
        )}
        {!loading && !error && filtered.length === 0 && (
          <article className="panel p-6 text-sm text-[var(--text-muted)]">No notifications yet.</article>
        )}
        {filtered.map((notification) => {
          const config = typeConfig[notification.type] || typeConfig.comment;
          const Icon = config.icon;
          return (
            <article key={notification.id} className={`panel p-5 transition hover:-translate-y-0.5 ${notification.read ? 'opacity-80' : 'ring-1 ring-[var(--primary)]/30'}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  <div className={`mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-soft)] ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-base font-semibold text-[var(--text)]">{notification.title}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs ${config.chip}`}>{notification.type}</span>
                      {!notification.read && <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">{notification.message}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span>{notification.actor}</span>
                      <span className="text-[var(--text-muted)]">|</span>
                      <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 md:justify-end">
                  {!notification.read && (
                    <button onClick={() => markAsRead(notification.id)} className="rounded-xl border border-[var(--outline)] px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-soft)]">
                      Read
                    </button>
                  )}
                  <button onClick={() => dismissNotification(notification.id)} className="rounded-xl border border-rose-300/30 px-3 py-2 text-sm text-rose-500 hover:bg-rose-100/50">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
      )}
    </div>
  );
};
