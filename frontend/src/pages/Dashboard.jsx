import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('published');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <Link
          to="/blogs/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Create New Blog
        </Link>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('published')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'published'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Published ({activeTab === 'published' && <span>Blogs</span>})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'drafts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Drafts
          </button>
        </nav>
      </div>

      <BlogList type={activeTab === 'published' ? 'my-published' : 'drafts'} />
    </div>
  );
};
