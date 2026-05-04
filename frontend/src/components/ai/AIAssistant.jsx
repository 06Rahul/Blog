import { useState } from 'react';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';

export const AIAssistant = ({ onApply, initialContent = '' }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Writing Assistant</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="8"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your content here..."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => handleFeature('enhance')}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFeature === 'enhance' && loading
              ? 'bg-primary-700 text-white'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading && activeFeature === 'enhance' ? 'Processing...' : 'Enhance'}
        </button>
        <button
          onClick={() => handleFeature('grammar')}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFeature === 'grammar' && loading
              ? 'bg-primary-700 text-white'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading && activeFeature === 'grammar' ? 'Processing...' : 'Fix Grammar'}
        </button>
        <button
          onClick={() => handleFeature('summarize')}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFeature === 'summarize' && loading
              ? 'bg-primary-700 text-white'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading && activeFeature === 'summarize' ? 'Processing...' : 'Summarize'}
        </button>
        <button
          onClick={() => handleFeature('titles')}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFeature === 'titles' && loading
              ? 'bg-primary-700 text-white'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading && activeFeature === 'titles' ? 'Processing...' : 'Suggest Titles'}
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Result</label>
            {onApply && (
              <button
                onClick={() => onApply(result)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Apply to Content
              </button>
            )}
          </div>
          <textarea
            value={result}
            readOnly
            rows="8"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(result);
              toast.success('Copied to clipboard!');
            }}
            className="mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};
