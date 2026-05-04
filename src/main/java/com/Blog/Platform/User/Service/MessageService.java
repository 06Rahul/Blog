package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.DTO.MessageResponse;
import com.Blog.Platform.User.DTO.SendMessageRequest;
import com.Blog.Platform.User.Model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface MessageService {
    
    // Send a message
    MessageResponse sendMessage(UUID conversationId, SendMessageRequest request);
    
    // Get messages for a conversation
    Page<MessageResponse> getMessages(UUID conversationId, Pageable pageable);
    
    // Mark message as read
    void markAsRead(UUID messageId);
    
    // Mark all messages in conversation as read for user
    void markConversationAsRead(UUID conversationId);
    
    // Get unread count for a conversation
    long getUnreadCount(UUID conversationId);
    
    // Get total unread messages for user
    long getTotalUnreadMessages();
    
    // Delete message
    void deleteMessage(UUID messageId);
    
    // Get message by ID
    Message getMessageById(UUID messageId);
}
