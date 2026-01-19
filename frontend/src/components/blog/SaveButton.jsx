import { useState, useEffect } from 'react';
import { savedBlogService } from '../../services/savedBlogService';
import toast from 'react-hot-toast';

export const SaveButton = ({ blogId, className = '', minimal = false }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSavedStatus();
    }, [blogId]);

    const checkSavedStatus = async () => {
        try {
            const status = await savedBlogService.isSaved(blogId);
            setIsSaved(status);
        } catch (error) {
            console.error('Failed to check saved status', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async (e) => {
        e.preventDefault(); // Prevent bubbling if checks inside link
        e.stopPropagation();

        try {
            if (isSaved) {
                await savedBlogService.unsaveBlog(blogId);
                setIsSaved(false);
                toast.success('Blog removed from saved');
            } else {
                await savedBlogService.saveBlog(blogId);
                setIsSaved(true);
                toast.success('Blog saved for later');
            }
        } catch (error) {
            toast.error('Failed to update saved status');
        }
    };

    if (loading) return null;

    if (minimal) {
        return (
            <button
                onClick={toggleSave}
                className={`p-1 transition-colors ${isSaved ? 'text-black' : 'text-gray-300 hover:text-black'
                    } ${className}`}
                title={isSaved ? 'Unsave' : 'Save for later'}
            >
                <svg
                    className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none'}`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                </svg>
            </button>
        );
    }

    return (
        <button
            onClick={toggleSave}
            className={`p-2 rounded-full transition-colors ${isSaved
                ? 'text-black bg-gray-100'
                : 'text-gray-400 hover:text-black hover:bg-gray-50'
                } ${className}`}
            title={isSaved ? 'Unsave' : 'Save for later'}
        >
            <svg
                className={`w-6 h-6 ${isSaved ? 'fill-current' : 'fill-none'}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
            </svg>
        </button>
    );
};
