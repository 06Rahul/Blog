package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.DTO.PresenceUpdate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class ChatPresenceService {

    private final ConcurrentMap<UUID, LocalDateTime> onlineUsers = new ConcurrentHashMap<>();
    private final ConcurrentMap<UUID, LocalDateTime> lastSeenUsers = new ConcurrentHashMap<>();

    public PresenceUpdate markOnline(UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        onlineUsers.put(userId, now);
        lastSeenUsers.put(userId, now);
        return new PresenceUpdate(userId, true, now);
    }

    public PresenceUpdate heartbeat(UUID userId) {
        return markOnline(userId);
    }

    public PresenceUpdate markOffline(UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        onlineUsers.remove(userId);
        lastSeenUsers.put(userId, now);
        return new PresenceUpdate(userId, false, now);
    }

    public boolean isOnline(UUID userId) {
        return onlineUsers.containsKey(userId);
    }

    public LocalDateTime getLastSeen(UUID userId) {
        return lastSeenUsers.get(userId);
    }
}
