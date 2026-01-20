import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatList } from '../components/messaging/ChatList';
import { ChatWindow } from '../components/messaging/ChatWindow';

export const MessagingPage = () => {
  const { conversationId } = useParams();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat List - visible on larger screens or when no conversation selected */}
      <div className={`${
        conversationId ? 'hidden lg:flex' : 'flex'
      } flex-col w-full lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
        <ChatList />
      </div>

      {/* Chat Window - visible when conversation selected or on larger screens */}
      {conversationId ? (
        <div className="flex-1 hidden lg:flex lg:flex-col">
          <ChatWindow />
        </div>
      ) : (
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:items-center lg:justify-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
        </div>
      )}

      {/* Mobile Chat Window */}
      {conversationId && (
        <div className="lg:hidden w-full">
          <ChatWindow />
        </div>
      )}
    </div>
  );
};
