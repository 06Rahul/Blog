package com.Blog.Platform.User.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class ConversationResponse {
    private UUID id;
    private UUID otherUserId;
    private String otherUserUsername;
    private String otherUserProfileImage;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
    private LocalDateTime createdAt;

    public ConversationResponse() {}

    public ConversationResponse(UUID id, UUID otherUserId, String otherUserUsername, 
                               String otherUserProfileImage, String lastMessage, 
                               LocalDateTime lastMessageAt, long unreadCount, LocalDateTime createdAt) {
        this.id = id;
        this.otherUserId = otherUserId;
        this.otherUserUsername = otherUserUsername;
        this.otherUserProfileImage = otherUserProfileImage;
        this.lastMessage = lastMessage;
        this.lastMessageAt = lastMessageAt;
        this.unreadCount = unreadCount;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOtherUserId() {
        return otherUserId;
    }

    public void setOtherUserId(UUID otherUserId) {
        this.otherUserId = otherUserId;
    }

    public String getOtherUserUsername() {
        return otherUserUsername;
    }

    public void setOtherUserUsername(String otherUserUsername) {
        this.otherUserUsername = otherUserUsername;
    }

    public String getOtherUserProfileImage() {
        return otherUserProfileImage;
    }

    public void setOtherUserProfileImage(String otherUserProfileImage) {
        this.otherUserProfileImage = otherUserProfileImage;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(long unreadCount) {
        this.unreadCount = unreadCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
