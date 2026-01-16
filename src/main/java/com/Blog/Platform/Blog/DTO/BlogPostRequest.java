package com.Blog.Platform.Blog.DTO;

import com.Blog.Platform.Blog.Model.BlogStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BlogPostRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String content;

    // Optional: default to DRAFT if null
    private BlogStatus status;

    // Tags (list of tag names)
    private List<String> tags;

    // Category ID
    private UUID categoryId;
}
