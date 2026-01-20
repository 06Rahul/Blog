package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.DTO.MessageResponse;
import com.Blog.Platform.User.DTO.SendMessageRequest;
import com.Blog.Platform.User.Service.MessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class ChatWebSocketController {

    private final MessageService messageService;

    public ChatWebSocketController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * Handle incoming messages and broadcast to conversation subscribers
     * Client sends to: /app/chat/{conversationId}
     * Server broadcasts to: /topic/conversation/{conversationId}
     */
    @MessageMapping("/chat/{conversationId}")
    @SendTo("/topic/conversation/{conversationId}")
    public MessageResponse handleMessage(
            @DestinationVariable UUID conversationId,
            @Payload SendMessageRequest message) {
        try {
            return messageService.sendMessage(conversationId, message);
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            throw new RuntimeException("Failed to send message", e);
        }
    }

    /**
     * Handle typing indicator
     * Client sends to: /app/typing/{conversationId}/{userId}
     * Server broadcasts to: /topic/typing/{conversationId}
     */
    @MessageMapping("/typing/{conversationId}/{userId}")
    @SendTo("/topic/typing/{conversationId}")
    public TypingIndicator handleTyping(
            @DestinationVariable UUID conversationId,
            @DestinationVariable UUID userId) {
        return new TypingIndicator(userId, true);
    }

    /**
     * Handle stop typing
     */
    @MessageMapping("/stop-typing/{conversationId}/{userId}")
    @SendTo("/topic/typing/{conversationId}")
    public TypingIndicator handleStopTyping(
            @DestinationVariable UUID conversationId,
            @DestinationVariable UUID userId) {
        return new TypingIndicator(userId, false);
    }

    // Simple DTO for typing indicator
    public static class TypingIndicator {
        public UUID userId;
        public boolean isTyping;

        public TypingIndicator(UUID userId, boolean isTyping) {
            this.userId = userId;
            this.isTyping = isTyping;
        }

        public UUID getUserId() {
            return userId;
        }

        public void setUserId(UUID userId) {
            this.userId = userId;
        }

        public boolean isTyping() {
            return isTyping;
        }

        public void setTyping(boolean typing) {
            isTyping = typing;
        }
    }
}
