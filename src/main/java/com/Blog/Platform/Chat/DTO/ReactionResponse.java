package com.Blog.Platform.Chat.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReactionResponse(UUID reactionId, UUID messageId, UUID userId, String emoji, LocalDateTime createdAt) {}
