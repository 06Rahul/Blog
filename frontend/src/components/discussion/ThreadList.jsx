import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { communityService } from '../../services/communityService';
import { Link } from 'react-router-dom';
import { MessageSquare, Pin, Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ThreadList = ({ communityId, isMember }) => {
    const [page, setPage] = useState(0);
    const size = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['community', communityId, 'threads', page],
        queryFn: () => communityService.getCommunityThreads(communityId, page, size),
        enabled: !!communityId
    });

    if (isLoading) return <div className="text-center py-8">Loading discussions...</div>;

    const threads = data?.content || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Discussions</h2>
                {isMember && (
                    <Link
                        to={`/communities/${communityId}/submit`}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        New Thread
                    </Link>
                )}
            </div>

            {threads.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No discussions yet. Start one!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {threads.map((thread) => (
                        <Link
                            key={thread.id}
                            to={`/threads/${thread.id}`}
                            className="block bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-colors shadow-sm"
                        >
                            <div className="flex items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                                        {thread.pinned && <Pin className="w-4 h-4 mr-2 text-indigo-500 transform rotate-45" />}
                                        {thread.title}
                                    </h3>

                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3 mt-2">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">{thread.authorName}</span>
                                            <span className="mx-1">•</span>
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                                        </div>
                                        <div className="flex items-center">
                                            <Eye className="w-3 h-3 mr-1" />
                                            {thread.viewCount}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
