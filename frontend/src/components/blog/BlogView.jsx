import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const BlogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlog();
  }, [id]);

  const loadBlog = async () => {
    try {
      // Try to load as published blog first
      try {
        const data = await blogService.getPublishedBlogById(id);
        setBlog(data);
      } catch (error) {
        // If not published, try loading as own blog
        if (user) {
          const data = await blogService.getMyBlogById(id);
          setBlog(data);
        } else {
          throw error;
        }
      }
    } catch (error) {
      toast.error('Blog not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      await blogService.deleteBlog(id);
      toast.success('Blog deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!blog) {
    return <div className="text-center py-12">Blog not found</div>;
  }

  const isOwner = user && blog.author?.id === user.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-white rounded-lg shadow-md p-8">
        {isOwner && (
          <div className="flex justify-end gap-2 mb-4">
            <Link
              to={`/blogs/${id}/edit`}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>

          {blog.summary && (
            <p className="text-xl text-gray-600 mb-6 italic">{blog.summary}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="font-semibold text-gray-900">
              By {blog.author?.username || 'Unknown'}
            </span>
            {blog.publishedAt && (
              <span>{format(new Date(blog.publishedAt), 'MMMM d, yyyy')}</span>
            )}
            {blog.category && (
              <span className="px-2 py-1 bg-gray-100 rounded">
                {blog.category.name}
              </span>
            )}
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {blog.content}
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {blog.status === 'PUBLISHED' ? 'Published' : 'Draft'}
              </p>
            </div>
            {isOwner && blog.status === 'DRAFT' && (
              <button
                onClick={async () => {
                  try {
                    await blogService.publishBlog(id);
                    toast.success('Blog published successfully!');
                    loadBlog();
                  } catch (error) {
                    toast.error('Failed to publish blog');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Publish Now
              </button>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
};
