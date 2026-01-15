package com.Blog.Platform.Blog.Mapper;

import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Model.BlogPost;
import org.springframework.stereotype.Component;

@Component
public class BlogPostMapper {

    public BlogPostResponse toResponse(BlogPost blog) {
        return new BlogPostResponse(
                blog.getId(),
                blog.getTitle(),
                blog.getContent(),
                blog.getSummary(),
                blog.getStatus(),
                blog.getAuthor().getId(),
                blog.getAuthor().getUsername(),
                blog.getCreatedAt(),
                blog.getUpdatedAt(),
                blog.getPublishedAt()
        );

    }
}
