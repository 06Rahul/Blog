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
        setSearchParams(params);
    };

    const handleCategoryChange = (categoryId) => {
        const params = {};
        if (searchQuery) params.q = searchQuery;
        if (categoryId) params.category = categoryId;
        setSearchParams(params);
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-blue-200 uppercase tracking-widest text-xs font-bold">
                            <Compass className="w-4 h-4" />
                            <span>Explore</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Communities</h1>
                        <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
                            Join vibrant communities to discuss your favorite topics, share knowledge, and connect with like-minded developers.
                        </p>
                    </div>
                    {user && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center gap-2"
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
            <div className="flex flex-col md:flex-row gap-6 sticky top-20 z-10 bg-gray-50 dark:bg-gray-900 py-2">
                <div className="flex-1">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={searchQuery}
                            placeholder="Find a community..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                        />
                    </form>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <button
                        onClick={() => handleCategoryChange('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <CommunityList search={searchQuery} category={selectedCategory} joined={searchParams.get('joined') === 'true'} />

            <CreateCommunityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
