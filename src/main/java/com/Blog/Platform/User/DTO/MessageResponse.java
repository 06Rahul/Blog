package com.Blog.Platform.User.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class MessageResponse {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String senderUsername;
    private String senderProfileImage;
    private String content;
    private LocalDateTime createdAt;
    private boolean isRead;
    private String mediaUrl;
    private String messageType;

    public MessageResponse() {}

    public MessageResponse(UUID id, UUID conversationId, UUID senderId, String senderUsername, 
                          String senderProfileImage, String content, LocalDateTime createdAt, 
                          boolean isRead, String mediaUrl, String messageType) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.senderUsername = senderUsername;
        this.senderProfileImage = senderProfileImage;
        this.content = content;
        this.createdAt = createdAt;
        this.isRead = isRead;
        this.mediaUrl = mediaUrl;
        this.messageType = messageType;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getConversationId() {
        return conversationId;
    }

    public void setConversationId(UUID conversationId) {
        this.conversationId = conversationId;
    }

    public UUID getSenderId() {
        return senderId;
    }

    public void setSenderId(UUID senderId) {
        this.senderId = senderId;
    }

    public String getSenderUsername() {
        return senderUsername;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }

    public String getSenderProfileImage() {
        return senderProfileImage;
    }

    public void setSenderProfileImage(String senderProfileImage) {
        this.senderProfileImage = senderProfileImage;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }
}
