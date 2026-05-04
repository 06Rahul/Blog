import api from '../utils/api';

export const authService = {
  // Signup
  signup: async (userData, imageFile) => {
    const formData = new FormData();
    
    // Append user data as JSON string
    formData.append('data', JSON.stringify(userData));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await api.post('/user/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifySignupOtp: async (payload) => {
    const response = await api.post('/user/signup/verify-otp', payload);
    return response.data;
  },

  resendSignupOtp: async (payload) => {
    const response = await api.post('/user/signup/resend-otp', payload);
    return response.data;
  },

  checkUsernameAvailability: async (username) => {
    const response = await api.get('/users/username-availability', {
      params: { username },
    });
    return response.data;
  },

  requestPasswordResetOtp: async (payload) => {
    const response = await api.post('/user/password-reset/request-otp', payload);
    return response.data;
  },

  verifyPasswordResetOtp: async (payload) => {
    const response = await api.post('/user/password-reset/verify-otp', payload);
    return response.data;
  },

  resetPasswordWithOtp: async (payload) => {
    const response = await api.post('/user/password-reset/confirm', payload);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/user/login', credentials);
    
    // Store access token (refresh token is sent as HttpOnly cookie)
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/user/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      // Refresh token cookie will be cleared by backend
    }
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/user/refresh', {});
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('accessToken');
  },
};
