package com.Blog.Platform.Blog.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "Content cannot be empty")
    private String content;
}
