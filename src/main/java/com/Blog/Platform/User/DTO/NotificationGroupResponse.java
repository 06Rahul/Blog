package com.Blog.Platform.User.DTO;

import com.Blog.Platform.User.Model.NotificationType;

import java.time.LocalDateTime;
import java.util.List;

public record NotificationGroupResponse(
        String groupKey,
        NotificationType type,
        String title,
        String message,
        String routeUrl,
        boolean read,
        int count,
        LocalDateTime latestCreatedAt,
        List<NotificationResponse> notifications
) {
}
