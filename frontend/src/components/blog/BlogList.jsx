import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { SaveButton } from './SaveButton';
import { useAuth } from '../../context/AuthContext';
import { savedBlogService } from '../../services/savedBlogService';

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
  const isDashboardView = ['drafts', 'my-published', 'saved'].includes(type);

  useEffect(() => {
    loadBlogs();
  }, [currentPage, type, categoryId, tag, username, searchQuery]);

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
      } else if (type === 'saved') {
        response = await savedBlogService.getSavedBlogs(currentPage, size);
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
        <div className="text-center py-20">
          <p className="text-gray-400 font-serif italic text-xl mb-6">No stories found.</p>
          {(type === 'drafts' || type === 'my-published') && (
            <Link
              to="/blogs/new"
              // className="inline-block border border-gray-900 dark:border-gray-100 px-8 py-3 text-gray-900 dark:text-gray-100 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900 transition-all"
              className="
inline-block
border border-cyan-300 dark:border-cyan-600
bg-cyan-50 dark:bg-cyan-950
px-8 py-3
text-cyan-700 dark:text-cyan-200
text-xs font-bold tracking-widest uppercase
hover:bg-cyan-500 dark:hover:bg-cyan-600
hover:text-white
transition-all duration-300
"

            >
              Start Writing
            </Link>
          )}
        </div>
      ) : (
        <>
          {blogs.map((blog) => (
            isDashboardView ? (
              // Compact List View for Dashboard
              <div
                key={blog.id}
                className="
    group
    flex items-center justify-between
    py-6
    bg-gray-50
    border-b border-gray-200
    rounded-lg
    hover:bg-gray-100
    -mx-4 px-4
    transition-colors
  "
              >


                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-1">
                    {blog.publishedAt && (
                      <time>{format(new Date(blog.publishedAt), 'MMM d, yyyy')}</time>
                    )}
                    {type === 'saved' && blog.authorUsername && (
                      <>
                        <span>•</span>
                        <span>by {blog.authorUsername}</span>
                      </>
                    )}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex gap-2">
                        {blog.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="bg-gray-100 text-gray-500 px-1.5 rounded text-[10px] uppercase tracking-wide">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-serif font-medium text-gray-900 truncate">
                    <Link to={`/blogs/${blog.id}`} className="hover:text-black transition-colors">
                      {blog.title}
                    </Link>
                  </h3>
                  {blog.summary && <p className="text-sm text-gray-500 line-clamp-1 mt-1 font-serif italic">{blog.summary}</p>}
                </div>

                <div className="flex items-center gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Dashboard Actions */}
                  {(type === 'drafts' || type === 'my-published') && (
                    <>
                      {type === 'drafts' && (
                        <button
                          onClick={() => handlePublish(blog.id)}
                          className="text-xs font-bold uppercase tracking-wider text-green-600 hover:text-green-800"
                        >
                          Publish
                        </button>
                      )}
                      <Link
                        to={`/blogs/${blog.id}/edit`}
                        className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="text-xs font-bold uppercase tracking-wider text-red-300 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {user && type === 'saved' && (
                    <SaveButton blogId={blog.id} minimal={true} />
                  )}
                </div>
              </div>
            ) : (
              // Editorial View for Feed
              <article key={blog.id} className="flex flex-col items-center text-center pb-20 border-b border-gray-100 last:border-0 last:pb-0">

                {/* Date */}
                {blog.publishedAt && (
                  <time className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 block">
                    {format(new Date(blog.publishedAt), 'MMMM d, yyyy')}
                  </time>
                )}

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6 leading-tight max-w-2xl">
                  <Link to={`/blogs/${blog.id}`} className="hover:text-gray-600 transition-colors">
                    {blog.title}
                  </Link>
                </h2>

                {/* Summary/Excerpt */}
                {blog.summary && (
                  <p className="text-gray-500 font-serif text-lg leading-relaxed mb-8 max-w-2xl line-clamp-3">
                    {blog.summary}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <Link
                    to={`/blogs/${blog.id}`}
                    className="
inline-block
border border-cyan-300 dark:border-cyan-600
bg-cyan-50 dark:bg-cyan-950
px-8 py-3
text-cyan-700 dark:text-cyan-200
text-xs font-bold tracking-widest uppercase
hover:bg-cyan-500 dark:hover:bg-cyan-600
hover:text-white
transition-all duration-300
rounded-full
rounded-lg
hover:scale-[1.02]
" >
                    Continue Reading
                  </Link>

                  {/* Minimal Save for Feed */}
                  {user && (
                    <div className="ml-2">
                      <SaveButton blogId={blog.id} minimal={true} />
                    </div>
                  )}
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-8 flex gap-2 justify-center">
                    {blog.tags.slice(0, 3).map((tag, i) => (
                      <Link key={i} to={`/search?tag=${tag}`} className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-black hover:underline decoration-1 underline-offset-4 transition-colors">#{tag}</Link>
                    ))}
                  </div>
                )}

              </article>
            )
          ))}

          {/* Internal Pagination - Removed in favor of External, only show if external not controlling */}
          {totalPages > 1 && controlledPage === undefined && (
            <div className="flex justify-center gap-8 pt-12 border-t border-gray-100">
              <button
                onClick={() => setInternalPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                &larr; Previous
              </button>
              <span className="text-xs font-bold tracking-widest uppercase text-black">
                Page {currentPage + 1}
              </span>
              <button
                onClick={() => setInternalPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
