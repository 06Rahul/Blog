import { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const BlogSearch = () => {
  const [searchType, setSearchType] = useState('title');
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
      let response;
      switch (searchType) {
        case 'title':
          response = await blogService.searchByTitle(query, 0, 10);
          break;
        case 'tag':
          response = await blogService.searchByTag(query, 0, 10);
          break;
        case 'author':
          response = await blogService.searchByAuthor(query, 0, 10);
          break;
        default:
          response = await blogService.searchByTitle(query, 0, 10);
      }

      setResults(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      toast.error('Search failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (newPage) => {
    setLoading(true);
    setPage(newPage);

    try {
      let response;
      switch (searchType) {
        case 'title':
          response = await blogService.searchByTitle(query, newPage, 10);
          break;
        case 'tag':
          response = await blogService.searchByTag(query, newPage, 10);
          break;
        case 'author':
          response = await blogService.searchByAuthor(query, newPage, 10);
          break;
      }

      setResults(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Blogs</h1>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2 mb-4">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="title">Search by Title</option>
              <option value="tag">Search by Tag</option>
              <option value="author">Search by Author</option>
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Enter ${searchType}...`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
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
            <div className="space-y-4">
              {results.map((blog) => (
                <div key={blog.id} className="border-b border-gray-200 pb-4">
                  <Link to={`/blogs/${blog.id}`}>
                    <h2 className="text-xl font-bold text-gray-900 hover:text-primary-600">
                      {blog.title}
                    </h2>
                  </Link>
                  {blog.summary && (
                    <p className="mt-2 text-gray-600 line-clamp-2">{blog.summary}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span>By {blog.author?.username || 'Unknown'}</span>
                    {blog.publishedAt && (
                      <span>{format(new Date(blog.publishedAt), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => loadPage(page - 1)}
                  disabled={page === 0 || loading}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => loadPage(page + 1)}
                  disabled={page >= totalPages - 1 || loading}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : query && !loading ? (
          <div className="text-center py-12 text-gray-500">No results found</div>
        ) : null}
      </div>
    </div>
  );
};
