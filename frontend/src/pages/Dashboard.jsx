import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('drafts');

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Manage your blog posts</p>
          </div>
          <Link
            to="/blogs/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Create New Blog
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-slate-800 border border-slate-700 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'published'
                  ? 'bg-slate-700 text-white'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              Published
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'drafts'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              Drafts
            </button>
          </div>
        </div>

        <BlogList type={activeTab === 'published' ? 'my-published' : 'drafts'} />
      </div>
    </div>
  );
};
