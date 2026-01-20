// import { useState } from 'react';
// import { blogService } from '../../services/blogService';
// import { Link } from 'react-router-dom';
// import { format } from 'date-fns';
// import toast from 'react-hot-toast';

// export const BlogSearch = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [blogs, setBlogs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searched, setSearched] = useState(false);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) return;

//     setLoading(true);
//     setSearched(true);
//     try {
//       const response = await blogService.searchByTitle(searchQuery, 0, 20);
//       setBlogs(response.content || []);
//     } catch (error) {
//       toast.error('Failed to search blogs');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-#b3ccff mb-4">Search Blogs</h1>
//           <form onSubmit={handleSearch} className="relative max-w-2xl">
//             <svg
//               className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search by title, author, or tags..."
//               className="w-full pl-12 pr-4 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//             />
//           </form>
//         </div>

//         {loading && (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-#b3ccff-600"></div>
//           </div>
//         )}

//         {!loading && searched && (
//           <>
//             <div className="mb-4 text-gray-400">
//               {blogs.length} {blogs.length === 1 ? 'result' : 'results'} found
//             </div>

//             <div className="space-y-4">
//               {blogs.map((blog) => (
//                 <div key={blog.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:bg-slate-750 transition-colors">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <Link to={`/blogs/${blog.id}`}>
//                         <h3 className="text-xl font-bold text-white mb-3 hover:text-purple-400 transition-colors">
//                           {blog.title}
//                         </h3>
//                       </Link>
//                       <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
//                         <span className="flex items-center gap-1">
//                           <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
//                             {blog.authorUsername?.[0]?.toUpperCase() || 'U'}
//                           </div>
//                           {blog.authorUsername}
//                         </span>
//                         {blog.publishedAt && (
//                           <span className="flex items-center gap-1">
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                             </svg>
//                             {format(new Date(blog.publishedAt), 'MMM d, yyyy')}
//                           </span>
//                         )}
//                       </div>
//                       {blog.tags && blog.tags.length > 0 && (
//                         <div className="flex gap-2">
//                           {blog.tags.map((tag) => (
//                             <span
//                               key={tag}
//                               className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm"
//                             >
//                               {tag}
//                             </span>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {blogs.length === 0 && (
//                 <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
//                   <svg
//                     className="w-16 h-16 text-Black-600 mx-auto mb-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                   <p className="text-gray-400 text-lg">No blogs found matching your search</p>
//                 </div>
//               )}
//             </div>
//           </>
//         )}

//         {!searched && !loading && (
//           <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
//             <svg
//               className="w-16 h-16 text-gray-600 mx-auto mb-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <p className="text-gray-400 text-lg">Enter a search term to find blogs</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
import { useState, useEffect } from 'react';
import { blogService } from '../../services/blogService';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const BlogSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await blogService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() && !selectedCategory) return;

    setLoading(true);
    setSearched(true);
    try {
      // Use unified search
      const response = await blogService.searchUnified(
        searchQuery,
        selectedCategory || null,
        0,
        20
      );
      setBlogs(response.content || []);
    } catch (error) {
      toast.error('Failed to search blogs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Search Blogs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl">
            Discover articles, authors, and ideas across the platform
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative max-w-3xl mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or tags..."
                className="w-full pl-12 pr-4 py-3
                    bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl
                    text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base
                    shadow-sm focus:shadow-md
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl
                    text-gray-700 dark:text-gray-300 text-base
                    shadow-sm focus:shadow-md
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition-all appearance-none cursor-pointer md:w-48"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            <div className="mb-5 text-gray-600 dark:text-gray-400 font-medium">
              {blogs.length} {blogs.length === 1 ? 'result' : 'results'} found
            </div>

            <div className="space-y-6">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700 rounded-2xl p-6
                    shadow-sm hover:shadow-lg hover:-translate-y-0.5
                    transition-all duration-300"
                >
                  <Link to={`/blogs/${blog.id}`}>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {blog.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-2">
                      {/* Avatar or Placeholder */}
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                        {blog.authorUsername?.[0]?.toUpperCase() || 'U'}
                      </div>
                      {blog.authorUsername}
                    </span>

                    {blog.category && (
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                        {blog.category.name}
                      </span>
                    )}

                    {blog.publishedAt && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {format(new Date(blog.publishedAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>

                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {blog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-sm
                            bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300
                            border border-blue-100 dark:border-blue-800"
                        >
                          #{tag.name || tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {blogs.length === 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-14 text-center shadow-sm">
                  <svg
                    className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No blogs found matching your search
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {!searched && !loading && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-14 text-center shadow-sm">
            <svg
              className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Enter a search term or select a category to find blogs
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

