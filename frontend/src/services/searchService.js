import api from '../utils/api';

export const searchService = {
    search: async (query, limit = 10) => {
        const response = await api.get(`/search?query=${encodeURIComponent(query)}&limit=${limit}`);
        return response.data;
    }
};
