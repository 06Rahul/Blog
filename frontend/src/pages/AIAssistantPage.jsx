import { useState } from 'react';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

export const AIAssistantPage = () => {
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAIAction = async (action) => {
    if (!content.trim()) {
      toast.error('Please enter some content first');
      return;
    }

    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'enhance':
          response = await aiService.enhanceWriting(content);
          break;
        case 'grammar':
          response = await aiService.fixGrammar(content);
          break;
        case 'summarize':
          response = await aiService.summarize(content);
          break;
        case 'titles':
          response = await aiService.suggestTitles(content);
          break;
        default:
          return;
      }
      setResult(response);
      toast.success('AI suggestion generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate AI suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">

        {/* Header Section */}
        <div className="mb-12 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
            <div className="w-64 h-64 bg-blue-500 rounded-full blur-3xl -ml-20"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl shadow-xl mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 drop-shadow-sm">
              AI Writing Assistant
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Supercharge your content creation with intelligent, AI-powered writing enhancements.
            </p>
          </div>
        </div>

        {/* content Area */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-2xl transition-all duration-300">
          <div className="mb-8">
            <label htmlFor="content" className="text-gray-700 dark:text-gray-200 font-bold text-lg mb-4 block flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Input Context
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-300 blur-sm"></div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your text here to get started..."
                className="relative w-full px-6 py-4 bg-white dark:bg-slate-900 border-0 rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 min-h-[220px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner resize-none text-lg leading-relaxed transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <ActionButton
              onClick={() => handleAIAction('enhance')}
              loading={loading}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />}
              label="Enhance"
              gradient="from-amber-500 to-orange-600"
            />
            <ActionButton
              onClick={() => handleAIAction('grammar')}
              loading={loading}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
              label="Fix Grammar"
              gradient="from-pink-500 to-rose-600"
            />
            <ActionButton
              onClick={() => handleAIAction('summarize')}
              loading={loading}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
              label="Summarize"
              gradient="from-blue-500 to-cyan-600"
            />
            <ActionButton
              onClick={() => handleAIAction('titles')}
              loading={loading}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
              label="Suggest Titles"
              gradient="from-violet-500 to-purple-600"
            />
          </div>

          {loading && (
            <div className="flex flex-col justify-center items-center py-12">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium animate-pulse">Consulting AI...</p>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden shadow-inner">
            <div className="px-6 py-4 bg-gray-100/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-gray-800 dark:text-gray-200 font-bold flex items-center gap-2">
                <span className="text-xl">✨</span>
                AI Analysis
              </h3>
              {result && (
                <button
                  onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied to clipboard!'); }}
                  className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Copy Result
                </button>
              )}
            </div>
            <div className="p-8 min-h-[150px]">
              {result ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">{result}</p>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 h-full py-8">
                  <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <p>Select an action above to generate a response</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ onClick, loading, icon, label, gradient }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`relative group overflow-hidden h-auto py-5 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
    <div className="relative flex flex-col items-center gap-2 z-10">
      <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <span>{label}</span>
    </div>
  </button>
);
