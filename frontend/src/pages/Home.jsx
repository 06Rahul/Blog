import { Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';

export const Home = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Blog Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Share your thoughts, ideas, and stories with the world
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/blogs/new"
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-lg font-medium"
          >
            Start Writing
          </Link>
          <Link
            to="/search"
            className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 text-lg font-medium"
          >
            Explore Blogs
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest Blogs</h2>
        <BlogList type="published" />
      </div>
    </div>
  );
};
