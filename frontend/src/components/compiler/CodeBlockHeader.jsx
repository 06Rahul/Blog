import toast from 'react-hot-toast';

export const CodeBlockHeader = ({ language, code }) => {

    const handleTryIt = () => {
        const encodedCode = encodeURIComponent(code || '');
        const encodedLang = encodeURIComponent(language || 'text');
        window.open(`/playground?language=${encodedLang}&code=${encodedCode}`, '_blank');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code || '');
        toast.success('Code copied!');
    };

    return (
        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-1 select-none">
            {/* Language Label (GFG Style) */}
            <div className="flex">
                <span className="px-4 py-1 bg-white dark:bg-gray-900 border-t-2 border-green-500 text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-wide">
                    {language || 'Code'}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleTryIt}
                    className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-xs font-semibold"
                    title="Run Code"
                >
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30">
                        <svg className="w-2.5 h-2.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                    </div>
                </button>

                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs font-semibold"
                    title="Copy Code"
                >
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                </button>
            </div>
        </div>
    );
};
