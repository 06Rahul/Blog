import api from '../utils/api';

export const discoveryService = {
  getCreatorLeaderboard: async (window = 'week', limit = 10, categoryId = '', rising = false) => {
    const response = await api.get('/discovery/leaderboards/creators', {
      params: { window, limit, categoryId: categoryId || undefined, rising },
    });
    return response.data;
  },

  getCommunityLeaderboard: async (window = 'week', limit = 10, rising = false) => {
    const response = await api.get('/discovery/leaderboards/communities', {
      params: { window, limit, rising },
    });
    return response.data;
  },

  getPostLeaderboard: async (window = 'week', limit = 10, categoryId = '') => {
    const response = await api.get('/discovery/leaderboards/posts', {
      params: { window, limit, categoryId: categoryId || undefined },
    });
    return response.data;
  },
};
