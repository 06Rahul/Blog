import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export const BlogList = ({
  type = 'published',
  categoryId = null,
  tag = null,
  searchQuery = null,
  username = null,
  page: controlledPage,
  size = 10,
  onDataLoaded
}) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internalPage, setInternalPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();

  const currentPage = controlledPage !== undefined ? controlledPage : internalPage;

  useEffect(() => {
    loadBlogs();
  }, [currentPage, type, categoryId, tag, username, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setInternalPage(0);
  }, [type, categoryId, tag, username, searchQuery]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'drafts') {
        response = await blogService.getMyDrafts(currentPage, size);
      } else if (type === 'my-published') {
        response = await blogService.getMyPublishedBlogs(currentPage, size);
      } else if (type === 'category') {
        response = await blogService.searchByCategory(categoryId, currentPage, size);
      } else if (type === 'tag') {
        response = await blogService.searchByTag(tag, currentPage, size);
      } else if (type === 'author') {
        response = await blogService.searchByAuthor(username, currentPage, size);
      } else if (type === 'search') {
        response = await blogService.searchUnified(searchQuery, currentPage, size);
      } else if (type === 'feed') {
        response = await blogService.getFeedBlogs(currentPage, size);
      } else {
        response = await blogService.getPublishedBlogs(currentPage, size);
      }

      setBlogs(response.content || []);
      const total = response.totalPages || 0;
      setTotalPages(total);

      if (onDataLoaded) {
        onDataLoaded({ totalPages: total, totalElements: response.totalElements });
      }
    } catch (error) {
      toast.error('Failed to load blogs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    try {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      const text = tmp.textContent || tmp.innerText || "";
      // Clean up extra whitespace and return trimmed text
      return text.trim().replace(/\s+/g, ' ');
    } catch (e) {
      // Fallback: use regex to strip tags if DOM manipulation fails
      return html.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
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
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await blogService.deleteBlog(blogId);
      toast.success('Blog deleted successfully');
      loadBlogs();
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const handleLike = async (blogId) => {
    try {
      await blogService.toggleLike(blogId);
      setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, isLiked: !b.isLiked, likeCount: b.isLiked ? (b.likeCount || 0) - 1 : (b.likeCount || 0) + 1 } : b));
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleBookmark = async (blogId) => {
    try {
      const { savedBlogService } = await import('../../services/savedBlogService');
      const isCurrentlySaved = blogs.find(b => b.id === blogId)?.isSaved;

      if (isCurrentlySaved) {
        await savedBlogService.unsaveBlog(blogId);
        toast.success('Removed from bookmarks');
      } else {
        await savedBlogService.saveBlog(blogId);
        toast.success('Added to bookmarks');
      }

      setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, isSaved: !isCurrentlySaved } : b));
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleShare = (blogId) => {
    const url = `${window.location.origin}/blogs/${blogId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const BlogCard = ({ blog }) => {
    const isDashboard = type === 'drafts' || type === 'my-published';

    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all mb-6 relative group"
      >
        {/* Author Header */}
        <div className="flex items-center justify-between mb-4">
          <Link to={`/profile/${blog.authorUsername}`} className="flex items-center gap-3 group">
            {blog.authorProfileImageUrl ? (
              <img src={blog.authorProfileImageUrl} alt={blog.authorUsername} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {blog.authorUsername?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">
                {blog.authorUsername || 'Blogger'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {blog.publishedAt ? format(new Date(blog.publishedAt), 'MMM d, yyyy') : 'Draft'}
              </p>
            </div>
          </Link>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <Link to={`/blogs/${blog.id}`} className="block group">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {blog.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
            {stripHtml(blog.summary || blog.content)}
          </p>
        </Link>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-6">
            {!isDashboard && (
              <>
                <button
                  onClick={() => handleLike(blog.id)}
                  className={`flex items-center gap-2 transition-colors text-sm font-medium group ${blog.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
                >
                  <Heart className={`w-5 h-5 ${blog.isLiked ? 'fill-current' : 'group-hover:fill-current'}`} />
                  <span>{blog.likeCount || 0}</span>
                </button>
                <Link to={`/blogs/${blog.id}#comments`} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors text-sm font-medium">
                  <MessageCircle className="w-5 h-5" />
                  <span>Comment</span>
                </Link>
              </>
            )}

            {isDashboard && (
              <div className="flex items-center gap-4">
                <Link to={`/blogs/${blog.id}/edit`} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                  Edit
                </Link>
                <button onClick={() => handleDelete(blog.id)} className="text-sm font-bold text-red-500 hover:text-red-700">
                  Delete
                </button>
                {type === 'drafts' && (
                  <button onClick={() => handlePublish(blog.id)} className="text-sm font-bold text-green-600 hover:text-green-800">
                    Publish
                  </button>
                )}
              </div>
            )}

          </div>
          <div className="flex items-center gap-4">
            {!isDashboard && (
              <>
                <button
                  onClick={() => handleShare(blog.id)}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleBookmark(blog.id)}
                  className={`transition-colors ${blog.isSaved ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                >
                  <Bookmark className={`w-5 h-5 ${blog.isSaved ? 'fill-current' : ''}`} />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.article>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-64 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {blogs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No stories found.</p>
          <Link to="/blogs/new" className="text-blue-600 font-semibold hover:underline">
            Write your first story
          </Link>
        </div>
      ) : (
        <>
          {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pb-8">
              <button
                disabled={currentPage === 0}
                onClick={() => setInternalPage(p => Math.max(0, p - 1))}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setInternalPage(p => p + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
