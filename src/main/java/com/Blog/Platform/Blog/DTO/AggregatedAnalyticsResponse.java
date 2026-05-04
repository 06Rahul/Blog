package com.Blog.Platform.Blog.DTO;

import java.util.UUID;

public record AggregatedAnalyticsResponse(
    long totalViews,
    long totalUniqueReaders,
    TopPostDto topPost,
    long totalKudosEarned,
    double estimatedEarnings,
    double avgReadCompletionRate
) {
    public record TopPostDto(UUID id, String title, long views) {}
}
