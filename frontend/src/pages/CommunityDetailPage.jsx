import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { communityService } from '../services/communityService';
import { CommunityHeader } from '../components/community/CommunityHeader';
import { ThreadList } from '../components/discussion/ThreadList';
import { Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const CommunityDetailPage = () => {
    const { id } = useParams();

    const { data: community, isLoading, isError, error } = useQuery({
        queryKey: ['community', id],
        queryFn: () => communityService.getCommunityById(id)
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (isError) {
        return <div className="text-center py-12 text-red-600">Error: {error.message}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CommunityHeader community={community} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ThreadList communityId={community.id} isMember={community.myRole != null} />
                </div>

                <div className="space-y-6">
                    {/* Sidebar - About */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">About Community</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{community.description}</p>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="text-xs text-gray-500">
                                Created {new Date(community.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Rules */}
                    {community.rules && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Community Rules</h3>
                            <div className="prose dark:prose-invert prose-sm">
                                <ReactMarkdown>{community.rules}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
