package com.Blog.Platform.Blog.DTO;

import com.Blog.Platform.Blog.Model.BlogStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BlogPostResponse {

    private UUID id;
    private String title;
    private String content;
    private String summary;      // ✅ ADD THIS
    private BlogStatus status;

    // Flattened author info
    private UUID authorId;
    private String authorUsername;
    private AuthorSummary author;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private CategorySummary category;
    private CommunitySummary community;
    private boolean communityExclusive;
    private List<TagSummary> tags;
    
    private UUID pollId;
    private int kudosCount;
    private List<CoauthorDto> coauthors;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthorSummary {
        private UUID id;
        private String username;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategorySummary {
        private UUID id;
        private String name;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CommunitySummary {
        private UUID id;
        private String name;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TagSummary {
        private UUID id;
        private String name;
    }
}
