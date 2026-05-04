package com.Blog.Platform.Discovery.DTO;

import com.Blog.Platform.Blog.DTO.BlogPostResponse;

public record TrendingPostEntry(
        BlogPostResponse post,
        long views,
        long completedReads,
        long likes,
        long comments,
        long saves,
        double score
) {
}
