package com.Blog.Platform.Discovery.DTO;

import java.util.UUID;

public record CommunityLeaderboardEntry(
        UUID communityId,
        String name,
        String ownerUsername,
        long memberCount,
        long joins,
        long newThreads,
        long replies,
        double score,
        boolean rising
) {
}
