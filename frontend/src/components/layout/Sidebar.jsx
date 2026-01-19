import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ categories = [] }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                setSearchParams({ q: query });
                navigate(`/?q=${encodeURIComponent(query)}`); // Fallback if not on home
            }
        }
    };

    const handleCategoryClick = (id) => {
        setSearchParams({ category: id });
        navigate(`/?category=${id}`);
    };

    return (
        <aside className="space-y-12">

            {/* Search Widget */}
            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-gray-900 border-b border-gray-200 pb-2 mb-6">
                    Search
                </h3>
                <input
                    type="text"
                    placeholder="Type and hit enter..."
                    onKeyDown={handleSearch}
                    defaultValue={searchParams.get('q') || ''}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
            </div>

            {/* User/Welcome Widget */}
            <div className="text-center bg-gray-50 p-6 rounded-sm">
                <h3 className="text-xs font-bold tracking-widest uppercase text-gray-900 mb-4">
                    {user ? 'Hello, ' + user.firstName : 'Welcome'}
                </h3>
                <p className="text-sm text-gray-500 font-serif italic leading-relaxed mb-4">
                    {user
                        ? "Ready to write your next story? Share your thoughts with the world."
                        : "Discover stories, thinking, and expertise from writers on any topic."}
                </p>
                {!user && (
                    <button onClick={() => navigate('/login')} className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600">
                        Join Community
                    </button>
                )}
            </div>

            {/* Categories Widget */}
            {categories.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-900 border-b border-gray-200 pb-2 mb-6">
                        Topics
                    </h3>
                    <ul className="space-y-3">
                        {categories.map(cat => (
                            <li key={cat.id}>
                                <button
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className="flex justify-between w-full text-sm text-gray-500 hover:text-black transition-colors group"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform">{cat.name}</span>
                                    {cat.count !== undefined && <span className="text-gray-300 group-hover:text-black">({cat.count})</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

        </aside>
    );
};
