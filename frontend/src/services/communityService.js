import api from '../utils/api';

export const communityService = {
    getAllCommunities: async (page = 0, size = 10, search = '', category = '', joined = false) => {
        const params = new URLSearchParams({ page, size });
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (joined) params.append('joined', 'true');

        const response = await api.get(`/communities?${params.toString()}`);
        return response.data;
    },

    getCommunityById: async (id) => {
        const response = await api.get(`/communities/${id}`);
        return response.data;
    },

    createCommunity: async (communityData) => {
        const response = await api.post(`/communities`, communityData);
        return response.data;
    },

    joinCommunity: async (id) => {
        const response = await api.post(`/communities/${id}/join`, {});
        return response.data;
    },

    leaveCommunity: async (id) => {
        const response = await api.post(`/communities/${id}/leave`, {});
        return response.data;
    },

    // Threads
    getCommunityThreads: async (communityId, page = 0, size = 10) => {
        const response = await api.get(`/communities/${communityId}/threads?page=${page}&size=${size}`);
        return response.data;
    },

    createThread: async (communityId, threadData) => {
        const response = await api.post(`/communities/${communityId}/threads`, threadData);
        return response.data;
    },

    getThreadById: async (threadId) => {
        const response = await api.get(`/threads/${threadId}`);
        return response.data;
    },

    createReply: async (threadId, replyData) => {
        const response = await api.post(`/threads/${threadId}/replies`, replyData);
        return response.data;
    },

    getThreadReplies: async (threadId, page = 0, size = 10) => {
        const response = await api.get(`/threads/${threadId}/replies?page=${page}&size=${size}`);
        return response.data;
    },

    deleteThread: async (threadId) => {
        const response = await api.delete(`/threads/${threadId}`);
        return response.data;
    },

    updateThread: async (threadId, data) => {
        const response = await api.put(`/threads/${threadId}`, data);
        return response.data;
    }
};
