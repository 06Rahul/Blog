import { useState } from 'react';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';

export const AIAssistant = ({ onApply, onSetTitle, initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  const handleFeature = async (feature) => {
    if (!content.trim()) {
      toast.error('Please enter some content first');
      return;
    }

    setLoading(true);
    setActiveFeature(feature);
    setResult('');

    try {
      let response;
      switch (feature) {
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
          throw new Error('Unknown feature');
      }

      setResult(response.result || response.content || 'No result received');
      toast.success(`${feature.charAt(0).toUpperCase() + feature.slice(1)} completed!`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${feature}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const parseTitles = (text) => {
    if (!text) return [];
    // Split by newlines, filter empty, remove numbering and asterisks
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[\d-][.)\]]\s*/, '').replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim())
      .filter(line => line.length > 5); // Basic filter for too short lines
  };

  return (
    <div className="card p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">AI Writing Assistant</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Context
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="6"
          className="input-field min-h-[150px] font-sans text-base"
          placeholder="Enter your content here to get AI suggestions..."
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { id: 'enhance', label: 'Enhance Writing', icon: '✨' },
          { id: 'grammar', label: 'Fix Grammar', icon: '📝' },
          { id: 'summarize', label: 'Summarize', icon: '📋' },
          { id: 'titles', label: 'Suggest Titles', icon: '💡' }
        ].map(feature => (
          <button
            key={feature.id}
            onClick={() => handleFeature(feature.id)}
            disabled={loading}
            className={`btn-secondary flex items-center gap-2 ${activeFeature === feature.id && loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            <span>{feature.icon}</span>
            {feature.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="shimmer h-32 rounded-lg w-full mb-6"></div>
      )}

      {result && !loading && (
        <div className="animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">
              {activeFeature === 'titles' ? 'Suggested Titles' : 'AI Suggestion'}
            </h3>
          </div>

          {activeFeature === 'titles' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parseTitles(result).map((title, index) => (
                <div key={index} className="group relative p-4 bg-white border border-gray-200 rounded-xl hover:shadow-glow transition-all duration-300 hover:border-primary-300">
                  <p className="text-gray-800 font-medium pr-8 mb-3">{title}</p>
                  <button
                    onClick={() => {
                      if (onSetTitle) onSetTitle(title);
                      toast.success('Title set!');
                    }}
                    className="w-full py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Set as Title
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="relative">
                <textarea
                  value={result}
                  readOnly
                  rows="8"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                {onApply && (
                  <button
                    onClick={() => onApply(result)}
                    className="btn-primary flex-1"
                  >
                    Apply to Content
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success('Copied to clipboard!');
                  }}
                  className="btn-secondary"
                >
                  Copy
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
