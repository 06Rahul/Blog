import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { communityService } from '../../services/communityService';
import { CommunityCard } from './CommunityCard';
import { Loader } from 'lucide-react';

export const CommunityList = ({ search = '', category = '', joined = false }) => {
    const [page, setPage] = useState(0);
    const size = 10;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['communities', page, search, category, joined],
        queryFn: () => communityService.getAllCommunities(page, size, search, category, joined)
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12 text-red-600 dark:text-red-400">
                Error loading communities: {error.message}
            </div>
        );
    }

    const communities = data?.content || [];

    return (
        <div>
            {communities.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No communities found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.map((community) => (
                        <CommunityCard key={community.id} community={community} />
                    ))}
                </div>
            )}

            {/* Basic Pagination */}
            <div className="mt-8 flex justify-center space-x-4">
                <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                >
                    Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Page {page + 1} of {data?.totalPages || 1}
                </span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={data?.last}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                >
                    Next
                </button>
            </div>
        </div>
    );
};
