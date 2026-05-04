import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const BlogList = ({ type = 'published', username, categoryId }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadBlogs();
  }, [page, type, username, categoryId]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'drafts') {
        response = await blogService.getMyDrafts(page, 10);
      } else if (type === 'my-published') {
        response = await blogService.getMyPublishedBlogs(page, 10);
      } else if (type === 'author' && username) {
        response = await blogService.searchByAuthor(username, page, 10);
      } else if (type === 'following') {
        response = await blogService.getFollowingFeed(page, 10);
      } else if (type === 'trending') {
        response = await blogService.getTrendingFeed(page, 10);
      } else {
        response = await blogService.getPublishedBlogs(categoryId, page, 10);
      }
      
      setBlogs(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      toast.error('Failed to load blogs');
      console.error(error);
    } finally {
      setLoading(false);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blogs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No blogs found</p>
          {(type === 'drafts' || type === 'my-published') && (
            <Link
              to="/blogs/new"
              className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Your First Blog
            </Link>
          )}
        </div>
      ) : (
        <>
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link to={`/blogs/${blog.id}`}>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors">
                      {blog.title}
                    </h2>
                  </Link>
                  {blog.summary && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {blog.summary}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                    <span className="font-medium text-gray-700 dark:text-gray-300">By @{blog.authorUsername || blog.author?.username || 'unknown'}</span>
                    {blog.publishedAt && (
                      <span>
                        {format(new Date(blog.publishedAt), 'MMM d, yyyy')}
                      </span>
                    )}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex gap-2">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded text-xs font-semibold"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {(type === 'drafts' || type === 'my-published') && (
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`/blogs/${blog.id}/edit`}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                Previous
              </button>
              <div className="flex items-center px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Page {page + 1} of {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
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
