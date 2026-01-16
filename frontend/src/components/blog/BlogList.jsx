import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const BlogList = ({ type = 'published', categoryId = null, tag = null, username = null }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadBlogs();
  }, [page, type, categoryId, tag, username]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'drafts') {
        response = await blogService.getMyDrafts(page, 10);
      } else if (type === 'my-published') {
        response = await blogService.getMyPublishedBlogs(page, 10);
      } else if (type === 'category') {
        response = await blogService.searchByCategory(categoryId, page, 10);
      } else if (type === 'tag') {
        response = await blogService.searchByTag(tag, page, 10);
      } else if (type === 'author') {
        response = await blogService.searchByAuthor(username, page, 10);
      } else {
        response = await blogService.getPublishedBlogs(page, 10);
      }

      setBlogs(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      toast.error('Failed to load blogs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (blogId) => {
    try {
      await blogService.publishBlog(blogId);
      toast.success('Blog published successfully');
      loadBlogs();
    } catch (error) {
      toast.error('Failed to publish blog');
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      await blogService.deleteBlog(blogId);
      toast.success('Blog deleted successfully');
      loadBlogs();
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blogs.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">No blogs found</p>
          {(type === 'drafts' || type === 'my-published') && (
            <Link
              to="/blogs/new"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Create Your First Blog
            </Link>
          )}
        </div>
      ) : (
        <>
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:bg-slate-750 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link to={`/blogs/${blog.id}`}>
                    <h3 className="text-xl font-bold text-white mb-3 hover:text-blue-400 transition-colors">
                      {blog.title}
                    </h3>
                  </Link>
                  {blog.summary && (
                    <p className="text-gray-400 mb-3 line-clamp-2">{blog.summary}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <Link
                      to={`/profile/${blog.authorUsername}`}
                      className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                    >
                      {blog.authorProfileImageUrl ? (
                        <img
                          src={blog.authorProfileImageUrl}
                          alt={blog.authorUsername}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                          {blog.authorUsername?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <span>{blog.authorUsername || 'Unknown'}</span>
                    </Link>
                    {blog.publishedAt && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {format(new Date(blog.publishedAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {blog.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {(type === 'drafts' || type === 'my-published') && (
                  <div className="flex gap-2 ml-4">
                    {type === 'drafts' && (
                      <button
                        onClick={() => handlePublish(blog.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <Link
                      to={`/blogs/${blog.id}/edit`}
                      className="px-4 py-2 border-2 border-blue-600 text-blue-400 hover:bg-blue-900/20 font-medium rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="px-4 py-2 border-2 border-red-600 text-red-400 hover:bg-red-900/20 font-medium rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-slate-800 border border-slate-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-slate-800 border border-slate-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
