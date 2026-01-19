import api from '../utils/api';

export const savedBlogService = {
    saveBlog: async (blogId) => {
        await api.post(`/saved-blogs/${blogId}`);
    },

    unsaveBlog: async (blogId) => {
        await api.delete(`/saved-blogs/${blogId}`);
    },

    isSaved: async (blogId) => {
        const response = await api.get(`/saved-blogs/${blogId}/is-saved`);
        return response.data;
    },

    getSavedBlogs: async (page = 0, size = 10) => {
        const response = await api.get(`/saved-blogs?page=${page}&size=${size}`);
        return response.data;
    }
};
