import api from '../utils/api';

export const compilerService = {
    /**
     * Get list of supported runtimes
     */
    getRuntimes: async () => {
        try {
            const response = await api.get('/compiler/runtimes');
            // Filter to common languages to avoid overwhelming the UI
            const commonLanguages = ['python', 'javascript', 'java', 'c++', 'c', 'go', 'rust', 'typescript', 'php', 'ruby', 'csharp', 'swift', 'kotlin'];
            return response.data.filter(r => commonLanguages.includes(r.language));
        } catch (error) {
            console.error('Failed to fetch runtimes', error);
            // Fallback basics if API lists fail
            return [
                { language: 'python', version: '3.10.0', aliases: ['py'] },
                { language: 'javascript', version: '18.15.0', aliases: ['js'] },
                { language: 'java', version: '15.0.2', aliases: [] },
                { language: 'c++', version: '10.2.0', aliases: ['cpp'] },
            ];
        }
    },

    /**
     * Execute code
     * @param {string} language - Language name (e.g., 'python')
     * @param {string} version - Language version
     * @param {string} code - Source code
     */
    executeCode: async (language, version, code) => {
        try {
            const response = await api.post('/compiler/execute', {
                language,
                version,
                code
            });
            return response.data;
        } catch (error) {
            console.error('Execution failed', error);
            throw error;
        }
    }
};
