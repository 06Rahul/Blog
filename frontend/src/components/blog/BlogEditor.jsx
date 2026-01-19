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
    <div className="min-h-screen bg-transparent">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-serif text-gray-900 mb-2">
              {id ? 'Edit Story' : 'New Story'}
            </h1>
            <p className="text-gray-400 font-serif italic text-lg">Share your voice with the world.</p>
          </div>
          <Link
            to="/ai"
            className="flex items-center gap-2 px-6 py-3 border border-[#d4cfe0] bg-[#e4dfef] text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-[#d4cfe0] hover:text-black transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Assistant
          </Link>
        </div>

        <div className="bg-white">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            {/* Title */}
            <div className="space-y-4">
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                placeholder="Title"
                className="w-full text-5xl md:text-6xl font-serif text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent leading-tight"
              />
              {errors.title && (
                <p className="text-sm text-red-500 font-medium pl-1">{errors.title.message}</p>
              )}
            </div>

            {/* Category & Tags Row */}
            <div className="flex flex-col md:flex-row gap-8 py-8 border-t border-b border-gray-100">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Category</label>
                <select
                  {...register('categoryId')}
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setValue('categoryId', e.target.value);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm py-3 px-4 rounded-none focus:outline-none focus:border-black"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-[2]">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Tags</label>
                <div className="flex gap-2">
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
                    placeholder="Add tag..."
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm py-3 px-4 rounded-none focus:outline-none focus:border-black w-40"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-6 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 ml-1"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {/* Content */}
            <div className="prose-editor">
              <div className="bg-white border rounded-none p-4 min-h-[600px]">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={watch('content')}
                  onChange={(value) => setValue('content', value)}
                  className="font-serif text-lg text-gray-800 h-[550px]"
                  placeholder="Tell your story..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'blockquote'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['link', 'code-block'],
                      ['clean']
                    ]
                  }}
                />
                <AnimatedQuillCaret quill={quillInstance} />
              </div>
              {errors.content && (
                <p className="mt-2 text-sm text-red-500 font-medium">{errors.content.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end pt-12 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-widest hover:border-black hover:text-black transition-colors"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-lg disabled:opacity-50"
              >
                {loading ? 'Saving...' : id ? 'Update Draft' : 'Save Draft'}
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
                  className="px-8 py-4 bg-green-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg"
                >
                  Publish Now
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
