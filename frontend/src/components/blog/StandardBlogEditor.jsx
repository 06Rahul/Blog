import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TiptapEditor } from './TiptapEditor';
import { AIAssistant } from '../ai/AIAssistant';
import { blogService } from '../../services/blogService';
import toast from 'react-hot-toast';

export const StandardBlogEditor = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [showAI, setShowAI] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const [categories, setCategories] = useState([]);

    const { id } = useParams(); // Get blog ID from URL

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await blogService.getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to categories', error);
                toast.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    // Fetch existing blog data if in edit mode
    useEffect(() => {
        if (!id) return;

        const fetchBlog = async () => {
            try {
                const blog = await blogService.getMyBlogById(id);
                setTitle(blog.title);
                setContent(blog.content);
                setCategoryId(blog.categoryId || ''); // Ensure categoryId is set
                // Map tags to string array if they are objects
                const tagNames = blog.tags ? blog.tags.map(t => typeof t === 'string' ? t : t.name) : [];
                setTags(tagNames);
                // setCoverImage(blog.coverImage); // If backend supports it later
            } catch (error) {
                console.error('Failed to load blog', error);
                toast.error('Failed to load blog for editing');
                navigate('/dashboard');
            }
        };
        fetchBlog();
    }, [id, navigate]);

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
            const imageUrl = URL.createObjectURL(file);
            setCoverImage(imageUrl);
        }
    };

    const handlePublish = async (status = 'published') => {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }
        if (!content.trim()) {
            toast.error('Please write some content');
            return;
        }
        if (!categoryId) {
            toast.error('Please select a category');
            return;
        }

        setIsPublishing(true);
        try {
            const blogData = {
                title,
                content,
                categoryId, // Send UUID
                tags,
                status: status.toUpperCase() // FIXED: Backend expects uppercase Enum (DRAFT, PUBLISHED)
            };

            await blogService.createBlog(blogData);

            toast.success(status === 'published' ? 'Story published!' : 'Draft saved!');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save story');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleAIApply = (newContent) => {
        setContent(newContent);
        toast.success('Content updated successfully!');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 w-full bg-white dark:bg-gray-800 z-40 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                        Writing Mode
                    </span>

                    <button
                        onClick={() => navigate('/blogs/live/new')}
                        className="flex items-center gap-2 px-4 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors ml-4"
                    >
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                        Go Live
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowAI(!showAI)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-medium ${showAI ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        AI Assistant
                    </button>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                    <button
                        onClick={() => handlePublish('draft')}
                        disabled={isPublishing}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors"
                    >
                        Save Draft
                    </button>

                    <button
                        onClick={() => handlePublish('published')}
                        disabled={isPublishing}
                        className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-bold uppercase tracking-wider hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                        {isPublishing ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Editor Scroll Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto py-12 px-8">
                        {/* Cover Image */}
                        <div className="mb-10 group relative h-72 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all flex items-center justify-center">
                            {coverImage ? (
                                <>
                                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setCoverImage(null)}
                                        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md text-red-500 hover:text-red-700 transition-opacity opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                                    <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <span className="text-lg font-medium">Add a cover image</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="space-y-6 mb-8">
                            <input
                                type="text"
                                placeholder="Article Title"
                                className="w-full text-5xl font-serif font-bold text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 border-none outline-none bg-transparent"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <div className="flex flex-wrap gap-4 items-center">
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>

                                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all shadow-sm">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                    <input
                                        type="text"
                                        placeholder="Add tags..."
                                        className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 flex-1 min-w-[100px]"
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
                                        <span key={index} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 rounded-full text-xs font-medium flex items-center gap-1">
                                            #{tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-700 text-indigo-400 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-100 transition-colors"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Editor */}
                        <div>
                            <TiptapEditor
                                content={content}
                                onChange={setContent}
                                isCollaborative={false}
                            />
                        </div>
                    </div>
                </div>

                {/* AI Panel (Right Side) */}
                {showAI && (
                    <div className="w-[450px] border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl animate-fade-in-right z-30 flex flex-col">
                        <AIAssistant
                            onApply={handleAIApply}
                            onSetTitle={setTitle}
                            initialContent={content}
                            onClose={() => setShowAI(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
