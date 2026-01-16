import api from '../utils/api';

export const aiService = {
  // Enhance writing
  enhanceWriting: async (content) => {
    const response = await api.post('/ai/enhance', { content });
    return response.data;
  },

  // Fix grammar
  fixGrammar: async (content) => {
    const response = await api.post('/ai/grammar', { content });
    return response.data;
  },

  // Summarize
  summarize: async (content) => {
    const response = await api.post('/ai/summarize', { content });
    return response.data;
  },

  // Suggest titles
  suggestTitles: async (content) => {
    const response = await api.post('/ai/titles', { content });
    return response.data;
  },

  // Get usage statistics
  getUsage: async () => {
    const response = await api.get('/ai/usage');
    return response.data;
  },
};
