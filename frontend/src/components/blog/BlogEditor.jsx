import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { blogService } from '../../services/blogService';
import { AIAssistant } from '../ai/AIAssistant';
import toast from 'react-hot-toast';

export const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAI, setShowAI] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
      tagIds: [],
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
      const [cats, tagList] = await Promise.all([
        blogService.getCategories(),
        blogService.getTags(),
      ]);
      setCategories(cats);
      setTags(tagList);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  };

  const loadBlog = async () => {
    try {
      const blog = await blogService.getMyBlogById(id);
      setValue('title', blog.title);
      setValue('content', blog.content);
      if (blog.category) {
        setSelectedCategory(blog.category.id);
        setValue('categoryId', blog.category.id);
      }
      if (blog.tags) {
        const tagIds = blog.tags.map((tag) => tag.id);
        setSelectedTags(tagIds);
        setValue('tagIds', tagIds);
      }
    } catch (error) {
      toast.error('Failed to load blog');
      navigate('/dashboard');
    }
  };

  const handleTagToggle = (tagId) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newSelectedTags);
    setValue('tagIds', newSelectedTags);
  };

  const handleAIApply = (result) => {
    setValue('content', result);
    setShowAI(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const blogData = {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId || null,
        tagIds: data.tagIds || [],
      };

      if (id) {
        await blogService.updateBlog(id, blogData);
        toast.success('Blog updated successfully!');
      } else {
        const newBlog = await blogService.createBlog(blogData);
        toast.success('Blog created successfully!');
        navigate(`/blogs/${newBlog.id}/edit`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Edit Blog' : 'Create New Blog'}
          </h1>
          <button
            type="button"
            onClick={() => setShowAI(!showAI)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            {showAI ? 'Hide' : 'Show'} AI Assistant
          </button>
        </div>

        {showAI && (
          <div className="mb-6">
            <AIAssistant onApply={handleAIApply} initialContent={content} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter blog title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              {...register('categoryId')}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setValue('categoryId', e.target.value);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              rows="20"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder="Write your blog content here..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {content?.length || 0} characters
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    navigate('/dashboard');
                  } catch (error) {
                    toast.error('Failed to publish blog');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Publish
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
