import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('drafts');

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-100 pb-8">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl font-serif text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-sm font-sans text-gray-400 tracking-wide uppercase">Manage your stories</p>
          </div>
          <Link
            to="/blogs/new"
            className="px-6 py-3 border border-black text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all"
          >
            Create New Story
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-12 flex justify-center md:justify-start">
          <div className="flex gap-8 text-xs font-bold tracking-widest uppercase text-gray-400">
            <button
              onClick={() => setActiveTab('published')}
              className={`pb-2 transition-all ${activeTab === 'published'
                ? 'text-black border-b-2 border-black'
                : 'hover:text-black'
                }`}
            >
              Published
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`pb-2 transition-all ${activeTab === 'drafts'
                ? 'text-black border-b-2 border-black'
                : 'hover:text-black'
                }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-2 transition-all ${activeTab === 'saved'
                ? 'text-black border-b-2 border-black'
                : 'hover:text-black'
                }`}
            >
              Saved
            </button>
          </div>
        </div>

        <BlogList type={
          activeTab === 'published' ? 'my-published'
            : activeTab === 'drafts' ? 'drafts'
              : 'saved' // saved
        } />
      </div>
    </div>
  );
};
