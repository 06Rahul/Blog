import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader2, BadgeCheck, Users, Hash, FileText, AlertCircle } from 'lucide-react';
import { searchService } from '../services/searchService';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ posts: [], users: [], communities: [], tags: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!query.trim() || query.trim() === initialQuery) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchService.getSuggestions(query.trim(), 6);
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Suggestion fetch failed', err);
        setSuggestions([]);
      }
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [initialQuery, query]);

  useEffect(() => {
    if (!initialQuery) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await searchService.search(initialQuery);
        setResults({
          posts: Array.isArray(data.blogs || data.posts) ? (data.blogs || data.posts) : [],
          users: Array.isArray(data.users) ? data.users : [],
          communities: Array.isArray(data.communities) ? data.communities : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
        });
      } catch (err) {
        console.error('Search failed', err);
        setResults({ posts: [], users: [], communities: [], tags: [] });
        setError('Search results are unavailable right now.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [initialQuery]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSuggestions([]);
    setSearchParams({ q: query.trim() });
  };

  const tabs = useMemo(() => [
    { id: 'all', label: 'All' },
    { id: 'posts', label: `Posts ${results.posts.length}` },
    { id: 'users', label: `Users ${results.users.length}` },
    { id: 'communities', label: `Communities ${results.communities.length}` },
    { id: 'tags', label: `Tags ${results.tags.length}` },
  ], [results]);

  const shouldShow = (id) => activeTab === 'all' || activeTab === id;
  const totalResults = results.posts.length + results.users.length + results.communities.length + results.tags.length;

  return (
    <div className="space-y-8">
      <section className="hero-panel p-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl font-semibold text-[var(--text)] md:text-4xl">Search posts, people, communities, and tags</h1>
          <p className="text-sm text-[var(--text-muted)] md:text-base">
            Search stays strict now: only backend data is rendered. When an endpoint is empty or unavailable, you see that state directly.
          </p>
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for posts, users, communities, tags..."
              className="w-full rounded-3xl border border-[var(--outline)] bg-[var(--surface)] py-4 pl-12 pr-4 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)]"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-10 rounded-3xl border border-[var(--outline)] bg-[var(--surface)] p-3 shadow-xl">
                <div className="space-y-2">
                  {suggestions.map((item) => (
                    <Link
                      key={`${item.type}-${item.label}`}
                      to={item.routeUrl}
                      onClick={() => setSuggestions([])}
                      className="block rounded-2xl px-4 py-3 transition hover:bg-[var(--surface-soft)]"
                    >
                      <div className="text-sm font-semibold text-[var(--text)]">{item.label}</div>
                      <div className="text-xs text-[var(--text-muted)]">{item.subtitle || item.type}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {initialQuery && (
        <section className="panel p-3">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
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
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : error ? (
        <section className="panel p-6">
          <div className="flex items-center gap-3 text-amber-500">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </section>
      ) : initialQuery && totalResults === 0 ? (
        <section className="panel p-8 text-center">
          <p className="text-lg font-medium text-[var(--text)]">No results found</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Try a different query or broader keywords.</p>
        </section>
      ) : initialQuery ? (
        <div className="space-y-8">
          {shouldShow('posts') && results.posts.length > 0 && (
            <section className="panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <FileText className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text)]">Posts</h2>
              </div>
              <div className="space-y-4">
                {results.posts.map((post) => (
                  <Link key={post.id} to={`/blogs/${post.id}`} className="block rounded-[24px] border border-[var(--outline)] bg-[var(--surface-soft)] p-5 transition hover:bg-[var(--surface)]">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span>{post.authorUsername}</span>
                      <span className="text-[var(--text-muted)]">|</span>
                      <span>{post.publishedAt}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-[var(--text)]">{post.title}</h3>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{post.summary}</p>
                    <div className="mt-4 flex gap-4 text-xs text-[var(--text-muted)]">
                      <span>{post.views} views</span>
                      <span>{post.likes} likes</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {shouldShow('users') && results.users.length > 0 && (
            <section className="panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <Users className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text)]">Users</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {results.users.map((user) => (
                  <Link key={user.id} to={`/profile/${user.username}`} className="rounded-[24px] border border-[var(--outline)] bg-[var(--surface-soft)] p-5 transition hover:bg-[var(--surface)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] font-semibold text-[var(--text)]">
                        {user.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[var(--text)]">@{user.username}</h3>
                          {user.verified && <BadgeCheck className="h-4 w-4 text-[var(--primary)]" />}
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{user.followers} followers</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-[var(--text-muted)]">{user.bio}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {shouldShow('communities') && results.communities.length > 0 && (
            <section className="panel p-6">
              <h2 className="mb-5 text-lg font-semibold text-[var(--text)]">Communities</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {results.communities.map((community) => (
                  <Link key={community.id} to={`/communities/${community.id}`} className="rounded-[24px] border border-[var(--outline)] bg-[var(--surface-soft)] p-5 transition hover:bg-[var(--surface)]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--text)]">{community.name}</h3>
                      {community.verified && <BadgeCheck className="h-4 w-4 text-[var(--primary)]" />}
                    </div>
                    <p className="mt-3 text-sm text-[var(--text-muted)]">{community.description}</p>
                    <p className="mt-4 text-xs text-[var(--text-muted)]">{community.members} members</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {shouldShow('tags') && results.tags.length > 0 && (
            <section className="panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <Hash className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text)]">Tags</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {results.tags.map((tag) => (
                  <div key={tag.id || tag.name} className="rounded-[24px] border border-[var(--outline)] bg-[var(--surface-soft)] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-[var(--text)]">#{tag.name}</h3>
                      {tag.trending && <span className="rounded-full bg-orange-400/15 px-2.5 py-1 text-xs text-orange-200">Trending</span>}
                    </div>
                    <p className="mt-4 text-sm text-[var(--text-muted)]">{tag.posts}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
};
