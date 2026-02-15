package com.Blog.Platform.Community.DTO;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class ReplyCreateRequest {

    @NotBlank(message = "Content is required")
    private String content;

    private UUID parentId; // Optional, for nested replies

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public UUID getParentId() {
        return parentId;
    }

    public void setParentId(UUID parentId) {
        this.parentId = parentId;
    }
}
