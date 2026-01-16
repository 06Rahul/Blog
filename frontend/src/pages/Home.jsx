import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';
import { blogService } from '../services/blogService';

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await blogService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories', error);
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
        />
      </div>
    </div>
  );
};
