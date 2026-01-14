package com.Blog.Platform.Blog.DTO;

import com.Blog.Platform.Blog.Model.BlogStatus;
import com.Blog.Platform.User.Model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BlogPostRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String content;

    // Optional: default to DRAFT if null
    private BlogStatus status;
}

