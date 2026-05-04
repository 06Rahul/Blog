import api from '../utils/api';

export const followService = {
    followUser: async (userId) => {
        const response = await api.post(`/users/${userId}/follow`);
        return response.data;
    },

    unfollowUser: async (userId) => {
        const response = await api.delete(`/users/${userId}/follow`);
        return response.data;
    },

    isFollowing: async (userId) => {
        const response = await api.get(`/users/${userId}/is-following`);
        return response.data;
    },

    getFollowerCount: async (userId) => {
        const response = await api.get(`/users/${userId}/followers/count`);
        return response.data;
    },

    getFollowingCount: async (userId) => {
        const response = await api.get(`/users/${userId}/following/count`);
        return response.data;
    },

    getFollowers: async (userId, page = 0, size = 10) => {
        const response = await api.get(`/users/${userId}/followers?page=${page}&size=${size}`);
        return response.data;
    },

    getFollowing: async (userId, page = 0, size = 10) => {
        const response = await api.get(`/users/${userId}/following?page=${page}&size=${size}`);
        return response.data;
    }
};
