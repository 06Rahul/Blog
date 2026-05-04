package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.DTO.ConversationResponse;
import com.Blog.Platform.User.Model.Conversation;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface ConversationService {

    // Get or create conversation between two users
    Conversation getOrCreateConversation(UUID user1Id, UUID user2Id);

    // Get conversation by ID
    Optional<Conversation> getConversation(UUID conversationId);

    // Get conversation details by ID
    ConversationResponse getConversationById(UUID conversationId);

    // Get all conversations for user
    Page<ConversationResponse> getUserConversations(Pageable pageable);

    // Get active conversations for user
    Page<ConversationResponse> getActiveConversations(Pageable pageable);

    // Check if users can chat (must be following each other or same user)
    boolean canChat(UUID user1Id, UUID user2Id);

    // Verify user access to conversation
    boolean hasAccessToConversation(UUID conversationId, UUID userId);

    // Delete/Archive conversation
    void deleteConversation(UUID conversationId);
}
