import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export const CommunityCard = ({ community }) => {
    // Generate a consistent gradient based on community name length or id
    const gradients = [
        'from-blue-400 to-indigo-500',
        'from-purple-400 to-pink-500',
        'from-teal-400 to-emerald-500',
        'from-orange-400 to-rose-500',
        'from-cyan-400 to-blue-500'
    ];
    const gradient = gradients[(community.name.length + (community.id ? community.id.charCodeAt(0) : 0)) % gradients.length];

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all h-full"
        >
            {/* Cover / Gradient Area */}
            <div className={`h-24 bg-gradient-to-r ${gradient} relative`}>
                <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-md">
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-300">
                            {community.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
                <div className="mb-2">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                            {community.name}
                        </h3>
                        {community.visibility === 'PRIVATE' && (
                            <Lock className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        c/{community.name.toLowerCase().replace(/\s+/g, '')}
                    </p>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2 flex-1">
                    {community.description || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-1.5 text-blue-500" />
                        {community.memberCount || 0} Members
                    </div>

                    <Link
                        to={`/communities/${community.id}`}
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg hover:bg-blue-600 dark:hover:bg-gray-200 transition-colors"
                    >
                        View
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};
