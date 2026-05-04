package com.Blog.Platform.Discovery.DTO;

import java.util.UUID;

public record CreatorLeaderboardEntry(
        UUID userId,
        String username,
        String displayName,
        long postViews,
        long completedReads,
        long likesReceived,
        long commentsReceived,
        long followersGained,
        double score,
        boolean rising
) {
}
