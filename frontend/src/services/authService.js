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

  // Verify OTP
  verifyOtp: async (otpData) => {
    const response = await api.post('/user/verify-otp', otpData);
    return response.data;
  },

  // Resend OTP
  resendOtp: async (emailData) => {
    const response = await api.post('/user/resend-otp', emailData);
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
