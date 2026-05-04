import { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import { searchService } from '../../services/searchService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const BlogSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    setPage(0);

    try {
      const response = await searchService.search(query);
      setResults(response.blogs || []);
      // Local pagination logic or just rely on search results
      setTotalPages(1); 
    } catch (error) {
      toast.error('Search failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (newPage) => {
    // Basic pagination (if searchService supports it)
    setLoading(true);
    setPage(newPage);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Search Blogs</h1>

        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, tag, category, or author..."
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-primary-500/20"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {loading && results.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="space-y-6">
              {results.map((blog) => (
                <div key={blog.id} className="group p-4 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all">
                  <Link to={`/blogs/${blog.id}`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      {blog.title}
                    </h2>
                  </Link>
                  {blog.summary && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2 text-sm leading-relaxed">{blog.summary}</p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                       By <span className="text-gray-900 dark:text-gray-300">@{blog.authorUsername || 'unknown'}</span>
                    </span>
                    {blog.publishedAt && (
                      <span>{format(new Date(blog.publishedAt), 'MMM d, yyyy')}</span>
                    )}
                    {blog.category && (
                        <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                            {blog.category.name}
                        </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : query && !loading ? (
          <div className="text-center py-12">
             <div className="text-gray-400 dark:text-gray-600 mb-2">No blogs found for "{query}"</div>
             <p className="text-sm text-gray-500">Try searching for different keywords or check your spelling.</p>
          </div>
        ) : (
            <div className="text-center py-12 text-gray-400 italic">
                Enter keywords to search across titles, tags, and more.
            </div>
        )}
      </div>
    </div>
  );
};
