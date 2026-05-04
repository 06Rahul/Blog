package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Service.BlogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/blogs/search")
@RequiredArgsConstructor
@Tag(name = "Blog Search", description = "Search endpoints for published blogs.")
public class BlogSearchController {

    private final BlogService blogService;

    @GetMapping("/title")
    @Operation(summary = "Search by title", description = "Searches published blogs by title (query parameter `q`).")
    public Page<BlogPostResponse> searchByTitle(
            @RequestParam String q,
            Pageable pageable
    ) {
        return blogService.searchByTitle(q, pageable);
    }

    @GetMapping("/tag")
    @Operation(summary = "Search by tag", description = "Searches published blogs by a tag name.")
    public Page<BlogPostResponse> searchByTag(
            @RequestParam String tag,
            Pageable pageable
    ) {
        return blogService.searchByTag(tag, pageable);
    }

    @GetMapping("/author")
    @Operation(summary = "Search by author", description = "Searches published blogs by author username.")
    public Page<BlogPostResponse> searchByAuthor(
            @RequestParam String username,
            Pageable pageable
    ) {
        return blogService.searchByAuthor(username, pageable);
    }
}
