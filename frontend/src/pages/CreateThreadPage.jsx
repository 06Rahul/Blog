import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../services/communityService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const CreateThreadPage = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: (data) => communityService.createThread(communityId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['community', communityId]);
            navigate(`/threads/${data.id}`); // Redirect to new thread
        },
        onError: (err) => {
            setError(err.response?.data?.message || 'Failed to create thread');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        mutation.mutate({ title, content });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create a New Thread</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        required
                        maxLength={200}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="An interesting title..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content
                    </label>
                    <div className="bg-white dark:bg-gray-800 rounded-md">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            className="h-64 mb-12 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mb-10"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 mb-10"
                    >
                        {mutation.isPending ? 'Posting...' : 'Post Thread'}
                    </button>
                </div>
            </form>
        </div>
    );
};
