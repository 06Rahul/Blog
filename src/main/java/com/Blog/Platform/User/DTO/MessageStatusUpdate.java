package com.Blog.Platform.User.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class MessageStatusUpdate {

    private UUID messageId;
    private UUID conversationId;
    private UUID actorUserId;
    private String status;
    private LocalDateTime deliveredAt;
    private LocalDateTime readAt;

    public MessageStatusUpdate() {
    }

    public MessageStatusUpdate(UUID messageId, UUID conversationId, UUID actorUserId, String status,
            LocalDateTime deliveredAt, LocalDateTime readAt) {
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.actorUserId = actorUserId;
        this.status = status;
        this.deliveredAt = deliveredAt;
        this.readAt = readAt;
    }

    public UUID getMessageId() {
        return messageId;
    }

    public void setMessageId(UUID messageId) {
        this.messageId = messageId;
    }

    public UUID getConversationId() {
        return conversationId;
    }

    public void setConversationId(UUID conversationId) {
        this.conversationId = conversationId;
    }

    public UUID getActorUserId() {
        return actorUserId;
    }

    public void setActorUserId(UUID actorUserId) {
        this.actorUserId = actorUserId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
}
