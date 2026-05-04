package com.Blog.Platform.User.DTO;

import java.util.UUID;

public record ProfileTopPostResponse(
        UUID id,
        String title,
        long views
) {
}
