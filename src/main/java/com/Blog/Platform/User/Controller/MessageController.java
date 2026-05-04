package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.DTO.MessageResponse;
import com.Blog.Platform.User.DTO.SendMessageRequest;
import com.Blog.Platform.User.Service.MessageService;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@PreAuthorize("isAuthenticated()")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * Send a message in a conversation
     */
    @PostMapping("/conversation/{conversationId}")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable UUID conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        MessageResponse message = messageService.sendMessage(conversationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /**
     * Get messages for a conversation (paginated)
     */
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<Page<MessageResponse>> getMessages(
            @PathVariable UUID conversationId,
            @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(messageService.getMessages(conversationId, pageable));
    }

    /**
     * Mark a message as read
     */
    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID messageId) {
        messageService.markAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    /**
     * Mark all messages in conversation as read
     */
    @PutMapping("/conversation/{conversationId}/read-all")
    public ResponseEntity<Void> markConversationAsRead(@PathVariable UUID conversationId) {
        messageService.markConversationAsRead(conversationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get unread message count for a conversation
     */
    @GetMapping("/conversation/{conversationId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable UUID conversationId) {
        long count = messageService.getUnreadCount(conversationId);
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get total unread messages for current user
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getTotalUnreadMessages() {
        long count = messageService.getTotalUnreadMessages();
        Map<String, Long> response = new HashMap<>();
        response.put("totalUnread", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a message
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }
}
