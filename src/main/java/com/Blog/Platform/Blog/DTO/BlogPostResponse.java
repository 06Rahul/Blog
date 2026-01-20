package com.Blog.Platform.Blog.DTO;

import com.Blog.Platform.Blog.Model.BlogStatus;

import java.time.LocalDateTime;
import java.util.UUID;

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
    private UUID categoryId;
    private String categoryName;

    public BlogPostResponse(UUID id, String title, String content, String summary, BlogStatus status, UUID authorId,
            String authorUsername, String authorProfileImageUrl, LocalDateTime createdAt, LocalDateTime updatedAt,
            LocalDateTime publishedAt, java.util.List<String> tags, UUID categoryId, String categoryName) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.summary = summary;
        this.status = status;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.authorProfileImageUrl = authorProfileImageUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.publishedAt = publishedAt;
        this.tags = tags;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public BlogStatus getStatus() {
        return status;
    }

    public void setStatus(BlogStatus status) {
        this.status = status;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public java.util.List<String> getTags() {
        return tags;
    }

    public void setTags(java.util.List<String> tags) {
        this.tags = tags;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}
