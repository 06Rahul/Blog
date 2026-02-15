import React from 'react';
import { Users, Lock, Globe, Settings, LogOut, LogIn } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';

export const CommunityHeader = ({ community }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const joinMutation = useMutation({
        mutationFn: () => communityService.joinCommunity(community.id),
        onSuccess: () => {
            queryClient.invalidateQueries(['community', community.id]);
        }
    });

    const leaveMutation = useMutation({
        mutationFn: () => communityService.leaveCommunity(community.id),
        onSuccess: () => {
            queryClient.invalidateQueries(['community', community.id]);
        }
    });

    const isMember = community.myRole != null;
    const isOwner = community.myRole === 'OWNER';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {community.name}
                        </h1>
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${community.visibility === 'PUBLIC'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                            {community.visibility === 'PUBLIC' ? <Globe className="w-3 h-3 inline mr-1" /> : <Lock className="w-3 h-3 inline mr-1" />}
                            {community.visibility}
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-2xl">
                        {community.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1.5" />
                            <span>{Math.max(community.memberCount || 0, isMember ? 1 : 0)} Members</span>
                        </div>
                        {community.categoryName && (
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                {community.categoryName}
                            </span>
                        )}
                        <div>
                            Created by <span className="font-medium text-gray-900 dark:text-gray-300">{community.ownerName}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex space-x-3">
                    {user && !isMember && (
                        <button
                            onClick={() => joinMutation.mutate()}
                            disabled={joinMutation.isPending}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Join Community
                        </button>
                    )}

                    {user && isMember && !isOwner && (
                        <button
                            onClick={() => leaveMutation.mutate()}
                            disabled={leaveMutation.isPending}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Leave
                        </button>
                    )}

                    {isOwner && (
                        <button
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
