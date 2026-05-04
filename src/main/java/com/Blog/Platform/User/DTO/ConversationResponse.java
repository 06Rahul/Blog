package com.Blog.Platform.User.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class ConversationResponse {
    private UUID id;
    private UUID otherUserId;
    private String otherUserUsername;
    private String otherUserProfileImage;
    private String otherUserBio;
    private String otherUserContactInfo;
    private String otherUserDisplayName;
    private boolean otherUserOnline;
    private LocalDateTime otherUserLastSeenAt;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
    private LocalDateTime createdAt;
    private UUID initiatorId;
    private com.Blog.Platform.User.Model.ConversationStatus status;

    public ConversationResponse() {}

    public ConversationResponse(UUID id, UUID otherUserId, String otherUserUsername,
                               String otherUserProfileImage, String otherUserBio,
                               String otherUserContactInfo, String otherUserDisplayName, boolean otherUserOnline,
                               LocalDateTime otherUserLastSeenAt, String lastMessage,
                               LocalDateTime lastMessageAt, long unreadCount, LocalDateTime createdAt,
                               UUID initiatorId, com.Blog.Platform.User.Model.ConversationStatus status) {
        this.id = id;
        this.otherUserId = otherUserId;
        this.otherUserUsername = otherUserUsername;
        this.otherUserProfileImage = otherUserProfileImage;
        this.otherUserBio = otherUserBio;
        this.otherUserContactInfo = otherUserContactInfo;
        this.otherUserDisplayName = otherUserDisplayName;
        this.otherUserOnline = otherUserOnline;
        this.otherUserLastSeenAt = otherUserLastSeenAt;
        this.lastMessage = lastMessage;
        this.lastMessageAt = lastMessageAt;
        this.unreadCount = unreadCount;
        this.createdAt = createdAt;
        this.initiatorId = initiatorId;
        this.status = status;
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

    public String getOtherUserBio() {
        return otherUserBio;
    }

    public void setOtherUserBio(String otherUserBio) {
        this.otherUserBio = otherUserBio;
    }

    public String getOtherUserContactInfo() {
        return otherUserContactInfo;
    }

    public void setOtherUserContactInfo(String otherUserContactInfo) {
        this.otherUserContactInfo = otherUserContactInfo;
    }

    public String getOtherUserDisplayName() {
        return otherUserDisplayName;
    }

    public void setOtherUserDisplayName(String otherUserDisplayName) {
        this.otherUserDisplayName = otherUserDisplayName;
    }

    public boolean isOtherUserOnline() {
        return otherUserOnline;
    }

    public void setOtherUserOnline(boolean otherUserOnline) {
        this.otherUserOnline = otherUserOnline;
    }

    public LocalDateTime getOtherUserLastSeenAt() {
        return otherUserLastSeenAt;
    }

    public void setOtherUserLastSeenAt(LocalDateTime otherUserLastSeenAt) {
        this.otherUserLastSeenAt = otherUserLastSeenAt;
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

    public UUID getInitiatorId() {
        return initiatorId;
    }

    public void setInitiatorId(UUID initiatorId) {
        this.initiatorId = initiatorId;
    }

    public com.Blog.Platform.User.Model.ConversationStatus getStatus() {
        return status;
    }

    public void setStatus(com.Blog.Platform.User.Model.ConversationStatus status) {
        this.status = status;
    }
}
