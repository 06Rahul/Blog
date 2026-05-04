package com.Blog.Platform.Blog.DTO;

import jakarta.validation.constraints.NotBlank;

public class CommentRequest {
    @NotBlank(message = "Content cannot be empty")
    private String content;

    private java.util.UUID parentId;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public java.util.UUID getParentId() {
        return parentId;
    }

    public void setParentId(java.util.UUID parentId) {
        this.parentId = parentId;
    }
}
