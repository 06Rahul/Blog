import api from '../utils/api';

export const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Get user by username
  getUserByUsername: async (username) => {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
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
