package com.Blog.Platform.User.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class PresenceUpdate {

    private UUID userId;
    private boolean online;
    private LocalDateTime lastSeenAt;

    public PresenceUpdate() {
    }

    public PresenceUpdate(UUID userId, boolean online, LocalDateTime lastSeenAt) {
        this.userId = userId;
        this.online = online;
        this.lastSeenAt = lastSeenAt;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }

    public LocalDateTime getLastSeenAt() {
        return lastSeenAt;
    }

    public void setLastSeenAt(LocalDateTime lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }
}
