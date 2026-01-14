package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.Blog.DTO.BlogPostRequest;
import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Service.BlogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    /* ===================== CREATE ===================== */

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<BlogPostResponse> createBlog(
            @Valid @RequestBody BlogPostRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(blogService.createBlog(request));
    }

    /* ===================== READ (MY BLOGS) ===================== */

    @GetMapping("/me/drafts")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<Page<BlogPostResponse>> getMyDrafts(
            Pageable pageable
    ) {
        return ResponseEntity.ok(blogService.getMyDrafts(pageable));
    }

    @GetMapping("/me/published")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<Page<BlogPostResponse>> getMyPublishedBlogs(
            Pageable pageable
    ) {
        return ResponseEntity.ok(blogService.getMyPublishedBlogs(pageable));
    }

    @GetMapping("/me/{blogId}")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<BlogPostResponse> getMyBlogById(
            @PathVariable UUID blogId
    ) {
        return ResponseEntity.ok(blogService.getMyBlogById(blogId));
    }

    /* ===================== READ (PUBLIC) ===================== */

    @GetMapping("/published")
    public ResponseEntity<Page<BlogPostResponse>> getPublishedBlogs(
            Pageable pageable
    ) {
        return ResponseEntity.ok(blogService.getPublishedBlogs(pageable));
    }

    /* ===================== UPDATE ===================== */

    @PutMapping("/{blogId}")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<BlogPostResponse> updateDraft(
            @PathVariable UUID blogId,
            @Valid @RequestBody BlogPostRequest request
    ) {
        return ResponseEntity.ok(
                blogService.updateDraft(blogId, request)
        );
    }

    /* ===================== PUBLISH ===================== */

    @PutMapping("/{blogId}/publish")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<BlogPostResponse> publishBlog(
            @PathVariable UUID blogId
    ) {
        return ResponseEntity.ok(
                blogService.publishBlog(blogId)
        );
    }

    /* ===================== DELETE ===================== */

    @DeleteMapping("/{blogId}")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<Void> deleteMyBlog(
            @PathVariable UUID blogId
    ) {
        blogService.deleteMyBlog(blogId);
        return ResponseEntity.noContent().build();
    }
}
