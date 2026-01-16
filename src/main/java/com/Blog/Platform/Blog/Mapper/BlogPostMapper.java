package com.Blog.Platform.Blog.Mapper;

import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Model.BlogPost;
import org.springframework.stereotype.Component;

@Component
public class BlogPostMapper {

    public BlogPostResponse toResponse(BlogPost blog) {
        // Use getActualUsername() since getUsername() returns email for Spring Security
        String actualUsername = blog.getAuthor().getActualUsername();

        return new BlogPostResponse(
                blog.getId(),
                blog.getTitle(),
                blog.getContent(),
                blog.getSummary(),
                blog.getStatus(),
                blog.getAuthor().getId(),
                actualUsername, // The actual username field
                blog.getAuthor().getProfileImageUrl(), // Profile image URL
                blog.getCreatedAt(),
                blog.getUpdatedAt(),
                blog.getPublishedAt(),
                // Convert tags to list of tag names
                blog.getTags() != null
                        ? blog.getTags().stream().map(tag -> tag.getName()).toList()
                        : java.util.Collections.emptyList(),
                // Get category name
                blog.getCategory() != null ? blog.getCategory().getName() : null);

    }
}
