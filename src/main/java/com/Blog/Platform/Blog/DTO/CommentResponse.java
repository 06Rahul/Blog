package com.Blog.Platform.Blog.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class CommentResponse {
    private UUID id;
    private String content;
    private UUID authorId;
    private String authorUsername;
    private String authorProfileImageUrl;
    private LocalDateTime createdAt;

    private UUID parentId;
    private java.util.List<CommentResponse> replies;

    public CommentResponse(UUID id, String content, UUID authorId, String authorUsername, String authorProfileImageUrl,
            LocalDateTime createdAt, UUID parentId, java.util.List<CommentResponse> replies) {
        this.id = id;
        this.content = content;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.authorProfileImageUrl = authorProfileImageUrl;
        this.createdAt = createdAt;
        this.parentId = parentId;
        this.replies = replies;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public UUID getAuthorId() {
        return authorId;
    }

    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }

    public String getAuthorProfileImageUrl() {
        return authorProfileImageUrl;
    }

    public void setAuthorProfileImageUrl(String authorProfileImageUrl) {
        this.authorProfileImageUrl = authorProfileImageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public UUID getParentId() {
        return parentId;
    }

    public void setParentId(UUID parentId) {
        this.parentId = parentId;
    }

    public java.util.List<CommentResponse> getReplies() {
        return replies;
    }

    public void setReplies(java.util.List<CommentResponse> replies) {
        this.replies = replies;
    }
}
