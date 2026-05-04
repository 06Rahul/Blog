import api from '../utils/api';

export const searchService = {
    search: async (query) => {
        const response = await api.get(`/search?query=${query}`);
        return response.data;
    }
};
