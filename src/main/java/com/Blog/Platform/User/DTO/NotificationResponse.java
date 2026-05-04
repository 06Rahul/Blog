package com.Blog.Platform.User.DTO;

import com.Blog.Platform.User.Model.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationResponse {

    private UUID id;
    private NotificationType type;
    private String referenceId;
    private String message;
    private boolean read;
    private String routeUrl;
    private LocalDateTime createdAt;
    private SenderSummary sender;

    public NotificationResponse() {
    }

    public NotificationResponse(UUID id, NotificationType type, String referenceId, String message, boolean read,
            String routeUrl, LocalDateTime createdAt, SenderSummary sender) {
        this.id = id;
        this.type = type;
        this.referenceId = referenceId;
        this.message = message;
        this.read = read;
        this.routeUrl = routeUrl;
        this.createdAt = createdAt;
        this.sender = sender;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public String getRouteUrl() {
        return routeUrl;
    }

    public void setRouteUrl(String routeUrl) {
        this.routeUrl = routeUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public SenderSummary getSender() {
        return sender;
    }

    public void setSender(SenderSummary sender) {
        this.sender = sender;
    }

    public static class SenderSummary {
        private UUID id;
        private String username;
        private String displayName;
        private String profileImageUrl;

        public SenderSummary() {
        }

        public SenderSummary(UUID id, String username, String displayName, String profileImageUrl) {
            this.id = id;
            this.username = username;
            this.displayName = displayName;
            this.profileImageUrl = profileImageUrl;
        }

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }

        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }
    }
}
