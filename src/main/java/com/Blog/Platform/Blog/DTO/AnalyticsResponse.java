package com.Blog.Platform.Blog.DTO;

import java.time.LocalDate;
import java.util.List;

public record AnalyticsResponse(
    long totalViews,
    long uniqueReaders,
    double avgCompletionPct,
    List<WeeklyTrendDto> weeklyTrend,
    List<ReferrerDto> topReferrers,
    long likeCount,
    long commentCount,
    long tipCount,
    long totalKudos
) {}
