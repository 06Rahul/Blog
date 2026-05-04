package com.Blog.Platform.User.DTO;

public record NotificationPreferenceResponse(
        boolean likes,
        boolean comments,
        boolean follows,
        boolean mentions,
        boolean messages,
        boolean community
) {
}
