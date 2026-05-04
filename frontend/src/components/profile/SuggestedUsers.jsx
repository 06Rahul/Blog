import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCcw, Users } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { FollowButton } from './FollowButton';
import { userService } from '../../services/userService';

export const SuggestedUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await userService.getSuggestions(15);
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading suggestions', err);
            setUsers([]);
            setError('Suggestions are unavailable right now.');
        } finally {
            setLoading(false);
        }
    };

    const displayedUsers = showAll ? users : users.slice(0, 5);

    return (
        <div className="rounded-[24px] border border-[var(--outline)] bg-[var(--surface-soft)] p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.16)]">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[var(--primary)]" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--text)]">Suggested for you</h3>
                </div>
                <button
                    onClick={loadSuggestions}
                    className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]"
                    title="Refresh suggestions"
                >
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading && users.length === 0 ? (
                <div className="space-y-4 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
                                <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    {error}
                </div>
            ) : users.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--outline)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-muted)]">
                    No follow suggestions are available yet.
                </div>
            ) : (
                <>
                    <div className="space-y-5">
                        {displayedUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between gap-3 group">
                                <Link to={`/profile/${encodeURIComponent(user.username)}`} className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-[var(--text)]" style={{ background: 'linear-gradient(135deg, var(--primary-soft), var(--secondary))' }}>
                                        {user.profileImageUrl ? (
                                            <img src={getImageUrl(user.profileImageUrl)} alt={user.username} className="h-full w-full object-cover" />
                                        ) : (
                                            user.username?.charAt(0)?.toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-[var(--text)]">
                                            {user.firstName} {user.lastName}
                                        </div>
                                        <div className="truncate text-xs text-[var(--text-muted)]">@{user.username}</div>
                                    </div>
                                </Link>
                                <div className="ml-2 flex-shrink-0">
                                    <FollowButton targetUserId={user.id} className="!px-3 !py-1 text-xs font-bold" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {users.length > 5 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="mt-6 w-full rounded-xl border border-dashed border-[var(--outline)] py-2.5 text-xs font-bold text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]"
                        >
                            {showAll ? 'Show Less' : `Show All (${users.length})`}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};
