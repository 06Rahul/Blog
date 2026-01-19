import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';
import { blogService } from '../services/blogService';

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadCategories();
  }, []);

  // Reset page when category changes
  useEffect(() => {
    setPage(0);
  }, [selectedCategory]);

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            Welcome to Blog Platform
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Share your thoughts, ideas, and stories with the world. A platform designed for creators and readers alike.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/blogs/new"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Start Writing
            </Link>
            <Link
              to="/search"
              className="px-8 py-3 border-2 border-blue-600 text-blue-400 hover:bg-blue-900/20 font-semibold rounded-lg transition-all"
            >
              Explore Blogs
            </Link>
          </div>
        </div>
      </div>

      {/* Latest Blogs Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-white">
            {selectedCategory
              ? `${categories.find(c => c.id === selectedCategory)?.name} Blogs`
              : 'Latest Blogs'
            }
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${!selectedCategory
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${selectedCategory === cat.id
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <BlogList
          type={selectedCategory ? 'category' : 'published'}
          categoryId={selectedCategory}
          page={page}
          size={pageSize}
          onDataLoaded={(data) => setTotalPages(data.totalPages)}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages - 1}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
