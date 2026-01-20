import { useState } from 'react';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';

export const AIAssistant = ({ onApply, onSetTitle, initialContent = '', onClose }) => {
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

      let aiText = response.result || response.content || 'No result received';

      // Strip HTML tags if present (fixes raw HTML showing in UI)
      if (aiText) {
        aiText = aiText.replace(/<[^>]*>?/gm, '');
      }

      if (!aiText.trim()) {
        aiText = 'AI returned no text content.';
      }

      setResult(aiText);

      // Direct Grammar Fix: Immediately update content if it's grammar
      if (feature === 'grammar') {
        onApply(aiText);
        toast.success('Grammar fixes applied!');
        if (onClose) onClose();
      }

      toast.success(`${feature.charAt(0).toUpperCase() + feature.slice(1)} completed!`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${feature}`);
      console.error(error);
      setActiveFeature(null); // Reset UI so user can try again
    } finally {
      setLoading(false);
    }
  };

  const parseTitles = (text) => {
    if (!text) return [];
    return text
      .split(/\n+/) // Split by one or more newlines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.toLowerCase().includes('here are') && !line.trim().endsWith(':')) // Filter preambles
      .map(line => line.replace(/^[\d-][.)\]]\s*/, '').replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim())
      .filter(line => line.length > 5);
  };

  return (
    <div className="card p-6 border border-gray-100 bg-white shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      {!activeFeature && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'enhance', label: 'Enhance', icon: '✨', desc: 'Improve writing style' },
            { id: 'grammar', label: 'Fix Grammar', icon: '📝', desc: 'Correct errors' },
            { id: 'summarize', label: 'Summarize', icon: '📋', desc: 'Create summary' },
            { id: 'titles', label: 'Suggest Titles', icon: '💡', desc: 'Generate ideas' }
          ].map(feature => (
            <button
              key={feature.id}
              onClick={() => handleFeature(feature.id)}
              disabled={loading}
              className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all group text-center"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{feature.icon}</span>
              <span className="font-semibold text-gray-900">{feature.label}</span>
              <span className="text-xs text-gray-500 mt-1">{feature.desc}</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 animate-pulse">AI is working on it...</p>
        </div>
      )}

      {/* Results View */}
      {result && !loading && (
        <div className="animate-fade-in flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 capitalize">
              {activeFeature === 'enhance' ? 'Review Changes' :
                activeFeature === 'titles' ? 'Select a Title' : 'Result'}
            </h3>
            <button
              onClick={() => { setActiveFeature(null); setResult(''); }}
              className="text-xs text-gray-500 hover:text-gray-900 underline"
            >
              Back to tools
            </button>
          </div>

          {activeFeature === 'titles' ? (
            <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2">
              {parseTitles(result).map((title, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (onSetTitle) onSetTitle(title);
                    toast.success('Title updated!');
                    if (onClose) onClose();
                  }}
                  className="text-left p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm transition-all"
                >
                  {title}
                </button>
              ))}
            </div>
          ) : activeFeature === 'grammar' ? (
            <div className="text-center py-8 text-green-600">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <p>Grammar fixed and applied!</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Comparison View for Enhance/Summarize */}
              <div className="grid grid-cols-2 gap-4 flex-1 mb-4 h-full">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2">Original</label>
                  <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg overflow-y-auto text-sm text-gray-600 whitespace-pre-wrap">
                    {content.replace(/<[^>]*>?/gm, '')}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-indigo-500 uppercase mb-2">Enhanced</label>
                  <div className="flex-1 p-3 bg-indigo-50 border border-indigo-200 rounded-lg overflow-y-auto text-sm text-indigo-900 whitespace-pre-wrap shadow-inner">
                    {result}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                {onApply && (
                  <button
                    onClick={() => {
                      onApply(result);
                      if (onClose) onClose();
                    }}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 hover:shadow-lg transition-all"
                  >
                    Apply Changes
                  </button>
                )}
                <button
                  onClick={() => { setActiveFeature(null); setResult(''); }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
