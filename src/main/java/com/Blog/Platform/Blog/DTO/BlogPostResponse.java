package com.Blog.Platform.Blog.DTO;

import com.Blog.Platform.Blog.Model.BlogStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class BlogPostResponse {

    private UUID id;
    private String title;
    private String content;
    private String summary;

    private BlogStatus status;

    // Flattened author info
    private UUID authorId;
    private String authorUsername;
    private String authorProfileImageUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    // Tags and Category
    private java.util.List<String> tags;
    private String categoryName;
}
