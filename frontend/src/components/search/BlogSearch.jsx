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
import { useState } from 'react';
import { blogService } from '../../services/blogService';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const BlogSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await blogService.searchByTitle(searchQuery, 0, 20);
      setBlogs(response.content || []);
    } catch (error) {
      toast.error('Failed to search blogs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent mb-4">
            Search Blogs
          </h1>
          <p className="text-stone-600 max-w-xl">
            Discover articles, authors, and ideas across the platform
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mt-6">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
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
              className="w-full pl-12 pr-4 py-4
                bg-stone-50 border border-stone-300 rounded-2xl
                text-stone-800 placeholder-stone-400 text-lg
                shadow-sm focus:shadow-md
                focus:outline-none focus:ring-2 focus:ring-indigo-400
                transition-all"
            />
          </form>
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            <div className="mb-5 text-stone-600 font-medium">
              {blogs.length} {blogs.length === 1 ? 'result' : 'results'} found
            </div>

            <div className="space-y-6">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-stone-100/90 backdrop-blur
                    border border-stone-200 rounded-3xl p-7
                    shadow-sm hover:shadow-lg hover:-translate-y-0.5
                    transition-all duration-300"
                >
                  <Link to={`/blogs/${blog.id}`}>
                    <h3 className="text-2xl font-bold text-stone-800 mb-4 hover:text-indigo-600 transition-colors">
                      {blog.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-5 text-sm text-stone-600 mb-4">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-200 to-blue-200 text-indigo-700 flex items-center justify-center text-xs font-semibold shadow-sm">
                        {blog.authorUsername?.[0]?.toUpperCase() || 'U'}
                      </div>
                      {blog.authorUsername}
                    </span>

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
                            bg-indigo-100 text-indigo-700
                            border border-indigo-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {blogs.length === 0 && (
                <div className="bg-stone-100 border border-stone-200 rounded-3xl p-14 text-center shadow-sm">
                  <svg
                    className="w-16 h-16 text-stone-400 mx-auto mb-4"
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
                  <p className="text-stone-600 text-lg">
                    No blogs found matching your search
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {!searched && !loading && (
          <div className="bg-stone-100 border border-stone-200 rounded-3xl p-14 text-center shadow-sm">
            <svg
              className="w-16 h-16 text-stone-400 mx-auto mb-4"
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
            <p className="text-stone-600 text-lg">
              Enter a search term to find blogs
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

