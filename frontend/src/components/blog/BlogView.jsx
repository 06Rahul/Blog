import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';
import { ScrollProgress } from '../layout/ScrollProgress';
import { blogService } from '../../services/blogService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import parse from 'html-react-parser';
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
      <ScrollProgress />
      <article className="bg-white rounded-lg shadow-md p-8 relative">
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
            <span className="font-semibold text-gray-900 flex items-center gap-2">
              {blog.authorProfileImageUrl && (
                <img
                  src={blog.authorProfileImageUrl}
                  alt={blog.authorUsername}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <Link to={`/profile/${blog.authorUsername}`} className="hover:underline text-primary-600">
                {blog.authorUsername || 'Unknown'}
              </Link>
            </span>
            {blog.publishedAt && (
              <span>{format(new Date(blog.publishedAt), 'MMMM d, yyyy')}</span>
            )}
            {blog.categoryName && (
              <span className="px-2 py-1 bg-gray-100 rounded">
                {blog.categoryName}
              </span>
            )}
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose max-w-none">
          <div className="text-gray-800 leading-relaxed ql-editor">
            {parse(blog.content)}
          </div>
        </div>

        <div className="flex items-center justify-between py-6 border-t border-gray-100 mt-8">
          <LikeButton blogId={id} />
        </div>

        <footer className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
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
        <CommentSection blogId={id} />
      </article>
    </div>
  );
};
