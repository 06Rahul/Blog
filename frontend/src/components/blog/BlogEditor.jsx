import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TiptapEditor } from './TiptapEditor';
import { AIAssistant } from '../ai/AIAssistant';
import toast from 'react-hot-toast';

export const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const categories = ['Technology', 'Lifestyle', 'Travel', 'Health', 'Business', 'Art', 'Science'];

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload to server/S3 here
      const imageUrl = URL.createObjectURL(file);
      setCoverImage(imageUrl);
    }
  };

  const handlePublish = async (status = 'published') => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setIsPublishing(true);
    try {
      // API call would go here
      // await blogService.createBlog({ title, content, category, tags, coverImage, status });

      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(status === 'published' ? 'Story published!' : 'Draft saved!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save story');
    } finally {
      setIsPublishing(false);
    }
  };

  const applyAIContent = (aiResult) => {
    navigator.clipboard.writeText(aiResult);
    toast.success('AI content copied to clipboard! Paste it where you want.');
    setShowAI(false);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-gray-100 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <span className="text-sm font-serif text-gray-500 italic">
            {id ? 'Editing Story' : 'Drafting new story'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAI(!showAI)}
            className={`p-2 rounded-full transition-all duration-300 ${showAI ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            title="AI Assistant"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>

          <button
            onClick={() => handlePublish('draft')}
            disabled={isPublishing}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
          >
            Save Draft
          </button>

          <button
            onClick={() => handlePublish('published')}
            disabled={isPublishing}
            className="px-6 py-2 bg-green-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto flex gap-8">
        {/* Main Editor Area */}
        <div className="flex-1 transition-all duration-300">
          {/* Cover Image */}
          <div className="mb-8 group relative h-64 bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center">
            {coverImage ? (
              <>
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button
                  onClick={() => setCoverImage(null)}
                  className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 group-hover:text-gray-500 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-sm font-medium">Add a cover image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          {/* Inputs */}
          <div className="mb-8 space-y-6">
            <input
              type="text"
              placeholder="Title"
              className="w-full text-5xl font-serif font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-medium text-gray-600 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                <input
                  type="text"
                  placeholder="Add generic tags..."
                  className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 flex-1 min-w-[100px]"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
              </div>
            </div>

            {/* Tags List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1 group">
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <TiptapEditor
            content={content}
            onChange={setContent}
            blogId={id}
          />
        </div>

        {/* AI Sidebar */}
        {showAI && (
          <div className="w-80 shrink-0 animate-fade-in-right">
            <div className="sticky top-24">
              <AIAssistant
                onApply={applyAIContent}
                onSetTitle={setTitle}
                initialContent={content}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
