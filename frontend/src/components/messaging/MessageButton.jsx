import React from 'react';
import { useNavigate } from 'react-router-dom';
import { conversationService } from '../../services/messagingService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const MessageButton = ({ userId, className = '' }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleStartConversation = async () => {
    if (!userId) {
      toast.error('User ID not found');
      return;
    }

    try {
      setIsLoading(true);
      const response = await conversationService.getOrCreateConversation(userId);
      
      // Extract conversation ID from response or navigate to messages
      const conversationId = response?.id;
      
      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      } else {
        navigate('/messages');
      }
      
      toast.success('Opening conversation...');
    } catch (err) {
      console.error('Failed to start conversation:', err);
      toast.error('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleStartConversation}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-60 transition-all ${className}`}
    >
      <span className="text-lg">💬</span>
      {isLoading ? 'Starting...' : 'Message'}
    </motion.button>
  );
};
