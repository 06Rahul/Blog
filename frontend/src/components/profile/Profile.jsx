import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Building2, FileText, PenSquare, Users, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import { userService } from '../../services/userService';
import { ProfileEdit } from './ProfileEdit';
import { getImageUrl } from '../../utils/imageUrl';
import { savedBlogService } from '../../services/savedBlogService';
import { communityService } from '../../services/communityService';
import { BlogList } from '../blog/BlogList';
import { FollowListModal } from './FollowListModal';

const tabButton = (active) => `rounded-2xl px-4 py-2 text-sm transition ${active ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)]'}`;

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [usage, setUsage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('blogs');
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [createdCommunities, setCreatedCommunities] = useState([]);
  const [topPost, setTopPost] = useState(null);
  const [activity, setActivity] = useState([]);
  const [modal, setModal] = useState({ open: false, type: 'followers' });

  useEffect(() => {
    if (!user) return;

    Promise.all([
      communityService.getMyJoinedCommunities(0, 50),
      communityService.getMyOwnedCommunities(0, 50),
    ])
      .then(([joined, owned]) => {
        setJoinedCommunities(joined.content || []);
        setCreatedCommunities(owned.content || []);
      })
      .catch((error) => console.error('Failed to load profile communities', error));
  }, [user]);

  useEffect(() => {
    const loadBase = async () => {
      try {
        const [usageData, topPostData, activityData] = await Promise.all([
          aiService.getUsage(),
          userService.getMyTopPost().catch(() => null),
          userService.getMyActivity(6).catch(() => []),
        ]);
        setUsage(usageData);
        setTopPost(topPostData);
        setActivity(Array.isArray(activityData) ? activityData : []);
      } catch (error) {
        console.error('Failed to load usage:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBase();
  }, []);

  useEffect(() => {
    if (!user) return;

    if (activeTab === 'bookmarks') {
      savedBlogService.getSavedBlogs(0, 20)
        .then((data) => setSavedBlogs(data.content || []))
        .catch((error) => console.error('Failed to load saved blogs', error));
    }

  }, [activeTab, user]);

  const handleProfileUpdate = async () => {
    await updateUser();
    setEditing(false);
  };

  const communityStats = useMemo(() => ({
    joined: user?.joinedCount ?? joinedCommunities.length,
    created: user?.createdCount ?? createdCommunities.length,
  }), [createdCommunities.length, joinedCommunities.length, user?.createdCount, user?.joinedCount]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (editing) {
    return <ProfileEdit onCancel={() => setEditing(false)} onSave={handleProfileUpdate} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="hero-panel overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-sky-200/40 via-cyan-200/20 to-amber-100/30 dark:from-cyan-500/20 dark:via-sky-500/10 dark:to-amber-300/10" />
        <div className="px-8 pb-8">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between -mt-10 mb-6">
            <div className="flex items-end gap-6">
              {user?.profileImageUrl ? (
                <img src={getImageUrl(user.profileImageUrl)} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--primary-soft)] to-[var(--secondary)] flex items-center justify-center text-4xl font-bold text-[var(--text)] border-4 border-white shadow-lg">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </div>
              )}
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-[var(--text)] leading-tight">{user?.firstName} {user?.lastName}</h1>
                <p className="text-[var(--text-muted)] font-medium">@{user?.username}</p>
              </div>
            </div>
            <button onClick={() => setEditing(true)} className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-contrast)] font-semibold rounded-2xl hover:opacity-90 transition-all">
              Edit Profile
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              {user?.bio && (
                <div className="rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] p-5 text-[var(--text)]">
                  {user.bio}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                <button onClick={() => setModal({ open: true, type: 'followers' })} className="rounded-2xl bg-[var(--surface-soft)] p-4 text-center border border-[var(--outline)]">
                  <div className="text-2xl font-bold text-[var(--text)]">{user?.followerCount || 0}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase">Followers</div>
                </button>
                <button onClick={() => setModal({ open: true, type: 'following' })} className="rounded-2xl bg-[var(--surface-soft)] p-4 text-center border border-[var(--outline)]">
                  <div className="text-2xl font-bold text-[var(--text)]">{user?.followingCount || 0}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase">Following</div>
                </button>
                <div className="rounded-2xl bg-[var(--surface-soft)] p-4 text-center border border-[var(--outline)]">
                  <div className="text-2xl font-bold text-[var(--text)]">{communityStats.joined}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase">Joined</div>
                </div>
                <div className="rounded-2xl bg-[var(--surface-soft)] p-4 text-center border border-[var(--outline)]">
                  <div className="text-2xl font-bold text-[var(--text)]">{communityStats.created}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase">Created</div>
                </div>
                <div className="rounded-2xl bg-[var(--surface-soft)] p-4 text-center border border-[var(--outline)]">
                  <div className="text-2xl font-bold text-[var(--text)]">{user?.postCount || 0}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase">Published</div>
                </div>
                <div className="rounded-2xl bg-[var(--surface-soft)] p-4 text-center border border-[var(--outline)]">
                  <div className="text-2xl font-bold text-[var(--text)]">{user?.draftCount || 0}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase">Drafts</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] p-6">
                <div className="flex items-center gap-2 text-[var(--text)]">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="font-semibold">AI Assistant Usage</h3>
                </div>
                {usage ? (
                  <>
                    <div className="mt-5 flex items-end justify-between">
                      <div className="text-3xl font-bold text-[var(--text)]">{usage.used}</div>
                      <div className="text-sm text-[var(--text-muted)]">of {usage.limit} requests</div>
                    </div>
                    <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-[var(--text-muted)]">Usage data unavailable.</p>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] p-6">
                <div className="flex items-center gap-2 text-[var(--text)]">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-semibold">Top Post This Month</h3>
                </div>
                {topPost ? (
                  <Link to={`/blogs/${topPost.id}`} className="mt-4 block rounded-2xl bg-[var(--surface-muted)] p-4 transition hover:bg-[var(--surface)]">
                    <div className="font-semibold text-[var(--text)] line-clamp-2">{topPost.title}</div>
                    <div className="mt-2 text-sm text-[var(--text-muted)]">{topPost.views || 0} views</div>
                  </Link>
                ) : (
                  <p className="mt-4 text-sm text-[var(--text-muted)]">No published post has enough activity yet.</p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[var(--surface-muted)] p-3 text-center">
                    <div className="text-lg font-semibold text-[var(--text)]">{user?.savedCount || 0}</div>
                    <div className="text-xs uppercase text-[var(--text-muted)]">Saved</div>
                  </div>
                  <div className="rounded-xl bg-[var(--surface-muted)] p-3 text-center">
                    <div className="text-lg font-semibold text-[var(--text)]">{user?.draftCount || 0}</div>
                    <div className="text-xs uppercase text-[var(--text-muted)]">Ready To Edit</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-[var(--text)]">Recent Activity</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Profile</span>
                </div>
                <div className="mt-4 space-y-3">
                  {activity.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">Activity will appear here after posts, comments, and community actions.</p>
                  ) : activity.map((item) => (
                    <Link
                      key={`${item.type}-${item.targetId}-${item.happenedAt}`}
                      to={item.targetUrl}
                      className="block rounded-2xl bg-[var(--surface-muted)] p-4 transition hover:bg-[var(--surface)]"
                    >
                      <div className="text-sm font-semibold text-[var(--text)]">{item.title}</div>
                      <div className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2">{item.subtitle}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {item.happenedAt ? formatDistanceToNow(new Date(item.happenedAt), { addSuffix: true }) : 'Recently'}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { id: 'blogs', label: 'My Blogs', icon: PenSquare },
                { id: 'bookmarks', label: 'Bookmarked', icon: Bookmark },
                { id: 'communities', label: 'Communities', icon: Building2 },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabButton(activeTab === tab.id)}>
                  <span className="inline-flex items-center gap-2"><tab.icon className="h-4 w-4" />{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="min-h-[200px]">
              {activeTab === 'blogs' && <BlogList type="my-published" />}

              {activeTab === 'bookmarks' && (
                <div className="grid grid-cols-1 gap-4">
                  {savedBlogs.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl border border-dashed border-[var(--outline)] bg-[var(--surface-muted)] text-[var(--text-muted)]">
                      No bookmarked blogs yet.
                    </div>
                  ) : (
                    savedBlogs.map((blog) => (
                      <Link key={blog.id} to={`/blogs/${blog.id}`} className="block rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] p-6 hover:shadow-md transition-all">
                        <div className="font-bold text-[var(--text)] text-lg mb-2">{blog.title}</div>
                        {blog.summary && <div className="text-sm text-[var(--text-muted)] line-clamp-2">{blog.summary}</div>}
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'communities' && (
                <div className="grid gap-8 xl:grid-cols-2">
                  <div>
                    <div className="mb-4 flex items-center gap-2 text-[var(--text)]">
                      <Users className="h-4 w-4" />
                      <h3 className="font-semibold">Joined Communities</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {joinedCommunities.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[var(--outline)] bg-[var(--surface-muted)] p-6 text-sm text-[var(--text-muted)]">
                          You have not joined any communities yet.
                        </div>
                      ) : joinedCommunities.map((community) => (
                        <Link key={community.id} to={`/communities/${community.id}`} className="block rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] p-5 hover:shadow-md">
                          <div className="font-semibold text-[var(--text)]">{community.name}</div>
                          {community.description && <div className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2">{community.description}</div>}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center gap-2 text-[var(--text)]">
                      <Building2 className="h-4 w-4" />
                      <h3 className="font-semibold">Communities You Created</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {createdCommunities.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[var(--outline)] bg-[var(--surface-muted)] p-6 text-sm text-[var(--text-muted)]">
                          You have not created any communities yet.
                        </div>
                      ) : createdCommunities.map((community) => (
                        <Link key={community.id} to={`/communities/${community.id}`} className="block rounded-2xl border border-[var(--outline)] bg-[var(--surface-soft)] p-5 hover:shadow-md">
                          <div className="font-semibold text-[var(--text)]">{community.name}</div>
                          {community.description && <div className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2">{community.description}</div>}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FollowListModal isOpen={modal.open} onClose={() => setModal((prev) => ({ ...prev, open: false }))} type={modal.type} userId={user?.id} />
    </div>
  );
};
