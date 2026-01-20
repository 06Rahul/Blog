package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Service.BlogService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/blogs/search")
public class BlogSearchController {

    private final BlogService blogService;

    public BlogSearchController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping("/title")
    public Page<BlogPostResponse> searchByTitle(
            @RequestParam String q,
            Pageable pageable) {
        return blogService.searchByTitle(q, pageable);
    }

    @GetMapping("/tag")
    public Page<BlogPostResponse> searchByTag(
            @RequestParam String tag,
            Pageable pageable) {
        return blogService.searchByTag(tag, pageable);
    }

    @GetMapping("/author")
    public Page<BlogPostResponse> searchByAuthor(
            @RequestParam String username,
            Pageable pageable) {
        return blogService.searchByAuthor(username, pageable);
    }

    @GetMapping("/category")
    public Page<BlogPostResponse> searchByCategory(
            @RequestParam UUID id,
            Pageable pageable) {
        return blogService.searchByCategory(id, pageable);
    }

    @GetMapping("/unified")
    public Page<BlogPostResponse> searchUnified(
            @RequestParam String q,
            @RequestParam(required = false) UUID categoryId,
            Pageable pageable) {
        return blogService.searchBlogs(q, categoryId, pageable);
    }
}
