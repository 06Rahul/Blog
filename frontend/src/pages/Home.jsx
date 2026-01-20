import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';
import { blogService } from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';

export const Home = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('q');
  const initialFeedType = searchParams.get('feed') || 'latest';

  const [categories, setCategories] = useState([]);
  const [feedType, setFeedType] = useState(initialFeedType);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadCategories();
  }, []);

  // Reset page when key filters change
  useEffect(() => {
    setPage(0);
  }, [selectedCategory, searchQuery, feedType]);

  const loadCategories = async () => {
    try {
      const cats = await blogService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (type, categoryId = null) => {
    const params = {};
    if (type !== 'latest') params.feed = type;
    if (categoryId) params.category = categoryId;
    setSearchParams(params);
    setFeedType(type);
  };

  const getListType = () => {
    if (searchQuery) return 'search';
    if (selectedCategory) return 'category';
    if (feedType === 'following') return 'feed';
    return 'published';
  };

  return (
    <div className="min-h-screen">

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

        {/* Main Content Area */}
        <div className="col-span-12 md:col-span-8">

          {/* Minimalist Filter Bar */}
          {!searchQuery && (
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-100 pb-4 mb-12">
              <h2 className="text-xl font-serif tracking-widest uppercase text-gray-900">
                {selectedCategory
                  ? categories.find(c => c.id === selectedCategory)?.name
                  : feedType === 'following' ? 'Following' : 'Latest Stories'
                }
              </h2>

              <div className="flex gap-6 text-xs font-bold tracking-widest uppercase text-gray-400 mt-4 md:mt-0">
                <button
                  onClick={() => handleFilterChange('latest')}
                  className={`hover:text-black transition-colors ${feedType === 'latest' && !selectedCategory ? 'text-black border-b-2 border-black pb-1' : ''}`}
                >
                  All
                </button>
                {user && (
                  <button
                    onClick={() => handleFilterChange('following')}
                    className={`hover:text-black transition-colors ${feedType === 'following' ? 'text-black border-b-2 border-black pb-1' : ''}`}
                  >
                    Following
                  </button>
                )}
                {categories.slice(0, 4).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleFilterChange('latest', cat.id)}
                    className={`hover:text-black transition-colors ${selectedCategory === cat.id ? 'text-black border-b-2 border-black pb-1' : ''}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchQuery && (
            <div className="mb-12 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-serif text-gray-900">
                Search Results for <span className="italic">"{searchQuery}"</span>
              </h2>
              <button onClick={() => setSearchParams({})} className="text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-500 mt-2">
                Clear Search
              </button>
            </div>
          )}

          <BlogList
            type={getListType()}
            categoryId={selectedCategory}
            searchQuery={searchQuery}
            page={page}
            size={pageSize}
            onDataLoaded={(data) => setTotalPages(data.totalPages)}
          />

          {/* Minimalist Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-8 mt-16 text-xs font-bold tracking-widest uppercase">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="hover:text-black text-blue-400 disabled:opacity-30 disabled:hover:text-blue-400 transition-colors"
              >
                &larr; Newer Posts
              </button>
              <span className="text-black">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages - 1}
                className="hover:text-black text-blue-400 disabled:opacity-30 disabled:hover:text-blue-400 transition-colors"
              >
                Older Posts &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block md:col-span-4 pl-8 border-l border-blue-100">
          <Sidebar categories={categories} />
        </div>

      </div>
    </div>
  );
};


