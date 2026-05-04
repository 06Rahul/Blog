import React, { useState, useEffect } from 'react';
import { CommunityList } from '../components/community/CommunityList';
import { CreateCommunityModal } from '../components/community/CreateCommunityModal';
import { Plus, Search, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { blogService } from '../services/blogService';
import { useSearchParams } from 'react-router-dom';

export const CommunitiesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);

    const selectedCategory = searchParams.get('category') || '';
    const searchQuery = searchParams.get('q') || '';
    const activeFilter = searchParams.get('filter') || 'featured';

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

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = formData.get('search');
        const params = {};
        if (query) params.q = query;
        if (selectedCategory) params.category = selectedCategory;
        if (activeFilter) params.filter = activeFilter;
        setSearchParams(params);
    };

    const handleCategoryChange = (categoryId) => {
        const params = {};
        if (searchQuery) params.q = searchQuery;
        if (categoryId) params.category = categoryId;
        if (activeFilter) params.filter = activeFilter;
        setSearchParams(params);
    };

    const handleFilterChange = (filter) => {
        const params = {};
        if (searchQuery) params.q = searchQuery;
        if (selectedCategory) params.category = selectedCategory;
        params.filter = filter;
        setSearchParams(params);
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="rounded-3xl p-8 text-[var(--primary-contrast)] shadow-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-[var(--primary-contrast)]/80 uppercase tracking-widest text-xs font-bold">
                            <Compass className="w-4 h-4" />
                            <span>Explore</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Communities</h1>
                        <p className="max-w-xl text-sm leading-relaxed text-[var(--primary-contrast)]/85">
                            Join vibrant communities to discuss your favorite topics, share knowledge, and connect with like-minded developers.
                        </p>
                    </div>
                    {user && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-[var(--surface)] text-[var(--text)] font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Community
                        </button>
                    )}
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-indigo-500 opacity-20 rounded-full blur-2xl"></div>
            </div>

            {/* Filters & Search */}
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'featured', label: 'Featured' },
                        { id: 'new', label: 'New' },
                        { id: 'trending', label: 'Trending' },
                        { id: 'joined', label: 'Joined' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleFilterChange(item.id)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeFilter === item.id ? 'bg-[var(--primary)] text-[var(--primary-contrast)]' : 'bg-[var(--surface-soft)] text-[var(--text)] border border-[var(--outline)] hover:bg-[var(--surface-muted)]'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-6 sticky top-20 z-10 py-2">
                <div className="flex-1">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={searchQuery}
                            placeholder="Find a community..."
                            className="w-full pl-12 pr-4 py-3 bg-[var(--surface)] border border-[var(--outline)] rounded-xl shadow-sm focus:ring-2 focus:ring-[var(--primary)] transition-all text-[var(--text)]"
                        />
                    </form>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <button
                        onClick={() => handleCategoryChange('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory
                                ? 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-md'
                                : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--outline)] hover:bg-[var(--surface-soft)]'
                            }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                                    ? 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-md'
                                    : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--outline)] hover:bg-[var(--surface-soft)]'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
            </div>

            <CommunityList search={searchQuery} category={selectedCategory} joined={activeFilter === 'joined'} filter={activeFilter} />

            <CreateCommunityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
