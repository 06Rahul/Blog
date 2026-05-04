import api from '../utils/api';

const mapReportPage = (payload) => {
  const content = Array.isArray(payload?.content) ? payload.content : [];
  return content.map((report) => ({
    id: report.id,
    type: report.itemType,
    severity: String(report.severity || 'LOW').toLowerCase(),
    status: String(report.status || 'PENDING').toLowerCase(),
    subject: report.reason,
    reportedBy: report.reporter?.username ? `@${report.reporter.username}` : 'Reporter hidden',
    timestamp: report.createdAt,
    reportedItemId: report.reportedItemId,
  }));
};

const mapModerationQueue = (payload) => {
  const posts = Array.isArray(payload?.posts) ? payload.posts : [];
  const comments = Array.isArray(payload?.comments) ? payload.comments : [];
  return [
    ...posts.map((post) => ({
      id: `post-${post.id}`,
      contentId: post.id,
      kind: 'post',
      label: post.title,
      state: String(post.moderationStatus || 'REJECTED'),
      reason: post.moderationReason || 'No moderation reason supplied.',
      createdAt: post.createdAt || post.publishedAt,
    })),
    ...comments.map((comment) => ({
      id: `comment-${comment.id}`,
      contentId: comment.id,
      kind: 'comment',
      label: comment.content?.slice(0, 100) || 'Comment',
      state: String(comment.moderationStatus || 'REJECTED'),
      reason: comment.moderationReason || 'No moderation reason supplied.',
      createdAt: comment.createdAt,
    })),
  ];
};

export const featureHubService = {
  getAdminDashboard: async () => {
    const [reportPage, moderationQueue] = await Promise.allSettled([
      api.get('/reports', { params: { status: 'PENDING', page: 0, size: 20 } }),
      api.get('/admin/moderation', { params: { status: 'REJECTED' } }),
    ]);

    const reports = reportPage.status === 'fulfilled' ? mapReportPage(reportPage.value.data) : [];
    const contentQueue = moderationQueue.status === 'fulfilled' ? mapModerationQueue(moderationQueue.value.data) : [];

    return {
      stats: [
        { label: 'Pending reports', value: String(reports.length), change: reportPage.status === 'fulfilled' ? 'Live' : 'Unavailable', tone: 'amber' },
        { label: 'Rejected posts/comments', value: String(contentQueue.length), change: moderationQueue.status === 'fulfilled' ? 'Live' : 'Unavailable', tone: 'rose' },
        { label: 'Resolved actions', value: `${reports.filter((item) => item.status === 'resolved').length}`, change: reportPage.status === 'fulfilled' ? 'Current page' : 'Unavailable', tone: 'emerald' },
        { label: 'Accounts endpoint', value: 'Missing', change: 'Not implemented', tone: 'sky' },
      ],
      reports,
      accounts: [],
      contentQueue,
      availability: {
        reports: reportPage.status === 'fulfilled',
        moderation: moderationQueue.status === 'fulfilled',
        accounts: false,
      },
    };
  },

  getAnalyticsDashboard: async (topPostId) => {
    const aggregatedResponse = await api.get('/users/me/analytics', { params: { period: 30 } });
    const aggregated = aggregatedResponse.data;
    const primaryPostId = topPostId || aggregated?.topPost?.id;
    let postAnalytics = null;

    if (primaryPostId) {
      try {
        const postResponse = await api.get(`/blogs/${primaryPostId}/analytics`);
        postAnalytics = postResponse.data;
      } catch (error) {
        console.error('Failed to fetch top post analytics', error);
      }
    }

    return {
      overview: {
        totalViews: aggregated?.totalViews ?? 0,
        totalUniqueReaders: aggregated?.totalUniqueReaders ?? 0,
        totalKudosEarned: aggregated?.totalKudosEarned ?? 0,
        estimatedEarnings: aggregated?.estimatedEarnings ?? 0,
        avgReadCompletionRate: aggregated?.avgReadCompletionRate ?? 0,
        topPost: aggregated?.topPost ?? null,
      },
      postAnalytics,
    };
  },

  getLeaderboards: async () => {
    throw new Error('Leaderboards backend is not implemented yet.');
  },
};
