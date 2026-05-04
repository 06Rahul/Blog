import api from '../utils/api';

export const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    const data = response.data;

    if (data?.email && data?.username && data.username.includes('@')) {
      try {
        const publicProfile = await userService.getUserByEmail(data.email);
        return {
          ...data,
          username: publicProfile?.username || data.username,
          profileImageUrl: data.profileImageUrl || publicProfile?.profileImageUrl,
          bannerImageUrl: data.bannerImageUrl || publicProfile?.bannerImageUrl,
        };
      } catch (error) {
        console.error('Failed to normalize current user username', error);
      }
    }

    return data;
  },

  // Get user by username
  getUserByUsername: async (username) => {
    const normalized = String(username || '').trim();

    if (!normalized) {
      throw new Error('Username is required');
    }

    if (normalized.includes('@')) {
      try {
        const response = await api.get(`/users/email/${encodeURIComponent(normalized)}`);
        return response.data;
      } catch (error) {
        console.error('Email-based profile lookup failed', error);
      }
    }

    try {
      const response = await api.get(`/users/username/${encodeURIComponent(normalized)}`);
      return response.data;
    } catch (error) {
      const lowered = normalized.toLowerCase();
      if (lowered !== normalized) {
        try {
          const retry = await api.get(`/users/username/${encodeURIComponent(lowered)}`);
          return retry.data;
        } catch (retryError) {
          console.error('Lowercase username lookup failed', retryError);
        }
      }

      const search = await api.get('/users/search', {
        params: { query: normalized, limit: 10 },
      });

      const matches = Array.isArray(search.data) ? search.data : [];
      const exact = matches.find((item) => item.username?.toLowerCase() === lowered);

      if (exact) {
        return exact;
      }

      throw error;
    }
  },

  // Get user by email
  getUserByEmail: async (email) => {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  },

  searchUsers: async (query, limit = 10) => {
    const response = await api.get('/users/search', {
      params: { query, limit },
    });
    return response.data;
  },

  getSuggestions: async (limit = 5) => {
    const response = await api.get('/users/suggestions', {
      params: { limit },
    });
    return response.data;
  },

  getMyTopPost: async () => {
    const response = await api.get('/users/me/top-post');
    return response.data;
  },

  getMyActivity: async (limit = 8) => {
    const response = await api.get('/users/me/activity', {
      params: { limit },
    });
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/me', profileData);
    return response.data;
  },

  // Update profile image
  updateProfileImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.put('/users/me/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
