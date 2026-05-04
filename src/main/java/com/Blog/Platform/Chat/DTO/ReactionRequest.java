package com.Blog.Platform.Chat.DTO;

import java.util.UUID;

public record ReactionRequest(UUID messageId, String emoji) {}
