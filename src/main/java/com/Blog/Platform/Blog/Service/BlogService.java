package com.Blog.Platform.Blog.Service;

import com.Blog.Platform.Blog.DTO.BlogPostRequest;
import com.Blog.Platform.Blog.DTO.BlogPostResponse;

import com.Blog.Platform.Blog.Model.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface BlogService {

    Page<BlogPostResponse> searchByTitle(String title, Pageable pageable);

    Page<BlogPostResponse> searchByTag(String tag, Pageable pageable);

    Page<BlogPostResponse> searchByAuthor(String username, Pageable pageable);

    Page<BlogPostResponse> searchByCategory(UUID categoryId, Pageable pageable);

    Page<BlogPostResponse> searchBlogs(String query, UUID categoryId, Pageable pageable);

    // Create

    BlogPostResponse createBlog(BlogPostRequest request);

    Page<BlogPostResponse> getMyDrafts(Pageable pageable);

    Page<BlogPostResponse> getMyPublishedBlogs(Pageable pageable);

    BlogPostResponse getMyBlogById(UUID blogId);

    Page<BlogPostResponse> getPublishedBlogs(Pageable pageable);

    BlogPostResponse getPublishedBlogById(UUID blogId);

    // Update
    BlogPostResponse updateDraft(UUID blogId, BlogPostRequest request);

    // Publish
    BlogPostResponse publishBlog(UUID blogId);

    // Delete
    void deleteMyBlog(UUID blogId);

    BlogPost getMyBlogEntity(UUID blogId);

    // For Feed
    Page<BlogPostResponse> getFeedBlogs(Pageable pageable);
}
