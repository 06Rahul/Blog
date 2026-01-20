package com.Blog.Platform.User.Controller;

import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.DTO.ConversationResponse;
import com.Blog.Platform.User.Service.ConversationService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@PreAuthorize("isAuthenticated()")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    /**
     * Get or create conversation with another user
     */
    @PostMapping("/with/{userId}")
    public ResponseEntity<Void> getOrCreateConversation(@PathVariable UUID userId) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        conversationService.getOrCreateConversation(currentUserId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get conversation details by ID
     */
    @GetMapping("/{conversationId}")
    public ResponseEntity<ConversationResponse> getConversation(@PathVariable UUID conversationId) {
        return ResponseEntity.ok(conversationService.getConversationById(conversationId));
    }

    /**
     * Get all conversations for current user
     */
    @GetMapping
    public ResponseEntity<Page<ConversationResponse>> getUserConversations(
            @PageableDefault(size = 20, sort = "lastMessageAt") Pageable pageable) {
        return ResponseEntity.ok(conversationService.getUserConversations(pageable));
    }

    /**
     * Get active conversations only
     */
    @GetMapping("/active")
    public ResponseEntity<Page<ConversationResponse>> getActiveConversations(
            @PageableDefault(size = 20, sort = "lastMessageAt") Pageable pageable) {
        return ResponseEntity.ok(conversationService.getActiveConversations(pageable));
    }

    /**
     * Delete/Archive a conversation
     */
    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable UUID conversationId) {
        conversationService.deleteConversation(conversationId);
        return ResponseEntity.noContent().build();
    }
}
