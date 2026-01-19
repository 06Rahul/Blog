package com.Blog.Platform.Blog.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class CommentResponse {
    private UUID id;
    private String content;
    private UUID authorId;
    private String authorUsername;
    private String authorProfileImageUrl;
    private LocalDateTime createdAt;

    private UUID parentId;
    private java.util.List<CommentResponse> replies;
}
