import { AIAssistant } from '../components/ai/AIAssistant';

export const AIAssistantPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Writing Assistant</h1>
      <AIAssistant />
    </div>
  );
};
