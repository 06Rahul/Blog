package com.Blog.Platform.User.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProfileActivityItemResponse(
        String type,
        String title,
        String subtitle,
        UUID targetId,
        String targetUrl,
        LocalDateTime happenedAt
) {
}
