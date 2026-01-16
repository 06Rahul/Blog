import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { blogService } from '../../services/blogService';
import { AIAssistant } from '../ai/AIAssistant';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AnimatedQuillCaret from './AnimatedQuillCaret';

export const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAI, setShowAI] = useState(false);
  const quillRef = useRef(null);
  const [quillInstance, setQuillInstance] = useState(null);

  useEffect(() => {
    if (quillRef.current) {
      setQuillInstance(quillRef.current.getEditor());
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
    },
  });

  const content = watch('content');

  useEffect(() => {
    loadMetaData();
    if (id) {
      loadBlog();
    }
  }, [id]);

  const loadMetaData = async () => {
    try {
      const cats = await blogService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  };

  const loadBlog = async () => {
    try {
      const blog = await blogService.getMyBlogById(id);
      setValue('title', blog.title);
      setValue('content', blog.content);
      if (blog.categoryName) {
        const category = categories.find(c => c.name === blog.categoryName);
        if (category) {
          setSelectedCategory(category.id);
          setValue('categoryId', category.id);
        }
      }
      if (blog.tags && blog.tags.length > 0) {
        setSelectedTags(blog.tags);
      }
    } catch (error) {
      toast.error('Failed to load blog');
      navigate('/dashboard');
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleAIApply = (result) => {
    setValue('content', result);
    setShowAI(false);
  };

  const handleAISetTitle = (title) => {
    setValue('title', title);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const blogData = {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId || null,
        tags: selectedTags,
      };

      if (id) {
        await blogService.updateBlog(id, blogData);
        toast.success('Blog updated successfully!');
        navigate('/dashboard');
      } else {
        await blogService.createBlog(blogData);
        toast.success('Blog created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {id ? 'Edit Blog' : 'Create New Blog'}
            </h1>
            <p className="text-gray-400">Share your story with the world</p>
          </div>
          <Link
            to="/ai"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Show AI Assistant
          </Link>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-white font-semibold mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                placeholder="Enter blog title..."
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-white font-semibold mb-2">
                Category
              </label>
              <select
                {...register('categoryId')}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setValue('categoryId', e.target.value);
                }}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-white font-semibold mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-3">Press Enter or click Add to add a tag</p>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-300"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-white font-semibold mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <div className="bg-white rounded-xl overflow-hidden">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={watch('content')}
                  onChange={(value) => setValue('content', value)}
                  className="h-96 mb-12"
                  placeholder="Write your blog content here..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['link', 'blockquote', 'code-block'],
                      ['clean']
                    ]
                  }}
                />
                <AnimatedQuillCaret quill={quillInstance} />
              </div>
              {errors.content && (
                <p className="mt-1 text-sm text-red-400">{errors.content.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border-2 border-slate-600 text-gray-300 hover:bg-slate-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : id ? 'Update Blog' : 'Create Blog'}
              </button>
              {id && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await blogService.publishBlog(id);
                      toast.success('Blog published successfully!');
                      navigate('/');
                    } catch (error) {
                      toast.error('Failed to publish blog');
                    }
                  }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Publish
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
