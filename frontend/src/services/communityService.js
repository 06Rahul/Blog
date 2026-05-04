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
        const response = await api.get(`/communities/threads/${threadId}`);
        return response.data;
    },

    createReply: async (threadId, replyData) => {
        const response = await api.post(`/communities/threads/${threadId}/replies`, replyData);
        return response.data;
    },

    getThreadReplies: async (threadId, page = 0, size = 10) => {
        const response = await api.get(`/communities/threads/${threadId}/replies?page=${page}&size=${size}`);
        return response.data;
    },

    deleteThread: async (threadId) => {
        const response = await api.delete(`/communities/threads/${threadId}`);
        return response.data;
    },

    deleteReply: async (replyId) => {
        const response = await api.delete(`/communities/threads/replies/${replyId}`);
        return response.data;
    },

    updateRules: async (communityId, rules) => {
        const response = await api.put(`/communities/${communityId}/rules`, { rules });
        return response.data;
    },

    updateThread: async (threadId, data) => {
        const response = await api.put(`/threads/${threadId}`, data);
        return response.data;
    },

    getMembers: async (communityId) => {
        const response = await api.get(`/communities/${communityId}/members`);
        return response.data;
    },

    addMember: async (communityId, userId) => {
        const response = await api.post(`/communities/${communityId}/members/${userId}`);
        return response.data;
    },

    removeMember: async (communityId, userId) => {
        const response = await api.delete(`/communities/${communityId}/members/${userId}`);
        return response.data;
    },

    assignRole: async (communityId, userId, role) => {
        const response = await api.put(`/communities/${communityId}/members/${userId}/role`, null, {
            params: { role }
        });
        return response.data;
    }
};
