import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { blogService } from '../../services/blogService';
import { communityService } from '../../services/communityService';
import { AIAssistant } from '../ai/AIAssistant';
import { TiptapEditor } from './TiptapEditor';
import toast from 'react-hot-toast';

export const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [communityExclusive, setCommunityExclusive] = useState(false);
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
      communityId: '',
      communityExclusive: false,
      tags: [],
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
      const [cats, tagList, joinedCommunities] = await Promise.all([
        blogService.getCategories(),
        blogService.getTags(),
        communityService.getAllCommunities(0, 100, '', '', true),
      ]);
      setCategories(cats);
      setTags(tagList);
      setCommunities(joinedCommunities?.content || []);
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
      if (blog.community) {
        setSelectedCommunity(blog.community.id);
        setValue('communityId', blog.community.id);
      }
      setCommunityExclusive(Boolean(blog.communityExclusive));
      setValue('communityExclusive', Boolean(blog.communityExclusive));
      if (blog.tags) {
        const tagNames = blog.tags.map((tag) => tag.name);
        setSelectedTags(tagNames);
        setValue('tags', tagNames);
      }
    } catch (error) {
      toast.error('Failed to load blog');
      navigate('/dashboard');
    }
  };

  const handleTagToggle = (tagName) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter((current) => current !== tagName)
      : [...selectedTags, tagName];
    setSelectedTags(newSelectedTags);
    setValue('tags', newSelectedTags);
  };

  const handleCustomTagAdd = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = e.target.value.trim().toLowerCase();
      if (newTag && !selectedTags.includes(newTag)) {
        const newSelectedTags = [...selectedTags, newTag];
        setSelectedTags(newSelectedTags);
        setValue('tags', newSelectedTags);
      }
      e.target.value = '';
    }
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
        communityId: data.communityId || null,
        communityExclusive: Boolean(data.communityId) && communityExclusive,
        tags: data.tags || [],
      };

      if (id) {
        await blogService.updateBlog(id, blogData);
        toast.success('Blog updated successfully');
      } else {
        const newBlog = await blogService.createBlog(blogData);
        toast.success('Blog created successfully');
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
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
              <label htmlFor="communityId" className="block text-sm font-medium text-gray-700 mb-2">
                Community
              </label>
              <select
                {...register('communityId')}
                value={selectedCommunity}
                onChange={(e) => {
                  setSelectedCommunity(e.target.value);
                  setValue('communityId', e.target.value);
                  if (!e.target.value) {
                    setCommunityExclusive(false);
                    setValue('communityExclusive', false);
                  }
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Public post</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCommunity && (
            <label className="flex items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <input
                type="checkbox"
                checked={communityExclusive}
                onChange={(e) => {
                  setCommunityExclusive(e.target.checked);
                  setValue('communityExclusive', e.target.checked);
                }}
              />
              Restrict this post to community members only
            </label>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tagName) => (
                <span
                  key={tagName}
                  className="px-3 py-1 rounded-full text-sm bg-primary-600 text-white flex items-center gap-1"
                >
                  {tagName}
                  <button type="button" onClick={() => handleTagToggle(tagName)} className="hover:text-red-300">&times;</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              onKeyDown={handleCustomTagAdd}
              placeholder="Type a tag and press Enter or Comma..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {tags.length > 0 && (
              <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-2 items-center">
                Popular: 
                {tags.slice(0, 10).map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                        if (!selectedTags.includes(tag.name)) {
                            handleTagToggle(tag.name);
                        }
                    }}
                    className={`px-2 py-0.5 rounded text-xs ${selectedTags.includes(tag.name) ? 'hidden' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    +{tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <input type="hidden" {...register('content', { required: 'Content is required' })} />
            <TiptapEditor
              content={content || ''}
              onChange={(value) => setValue('content', value, { shouldValidate: true })}
              blogId={id}
              isCollaborative={false}
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
            <p className="mt-2 text-sm text-gray-500">{content?.length || 0} characters</p>
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
                    toast.success('Blog published successfully');
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
