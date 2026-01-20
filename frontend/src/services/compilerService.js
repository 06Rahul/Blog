import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

export const compilerService = {
    /**
     * Get list of supported runtimes
     */
    getRuntimes: async () => {
        try {
            const response = await axios.get(`${PISTON_API_URL}/runtimes`);
            // Filter to common languages to avoid overwhelming the UI
            const commonLanguages = ['python', 'javascript', 'java', 'c++', 'c', 'go', 'rust', 'typescript', 'php', 'ruby'];
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
            // Determine file extension based on language
            const extensionMap = {
                python: 'py',
                javascript: 'js',
                typescript: 'ts',
                java: 'java',
                cpp: 'cpp',
                c: 'c',
                go: 'go',
                rust: 'rs',
                php: 'php',
                ruby: 'rb'
            };
            const ext = extensionMap[language] || 'txt';

            const response = await axios.post(`${PISTON_API_URL}/execute`, {
                language: language,
                version: version,
                files: [
                    {
                        name: `main.${ext}`,
                        content: code
                    }
                ]
            });
            return response.data;
        } catch (error) {
            console.error('Execution failed', error);
            throw error;
        }
    }
};
