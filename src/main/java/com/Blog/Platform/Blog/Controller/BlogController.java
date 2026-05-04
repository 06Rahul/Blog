package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.AiService.ServiceImpl.AsyncAiWorker;
import com.Blog.Platform.Blog.DTO.BlogPostRequest;
import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Service.BlogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Blogs", description = "Create, read, update, publish, and delete blog posts.")
public class BlogController {

    private final BlogService blogService;
    private final AsyncAiWorker asyncAiWorker;

    @PostMapping("/{id}/generate-summary")
    @PreAuthorize("hasAnyRole('AUTHOR','ADMIN')")
    @Operation(summary = "Regenerate summary", description = "Triggers asynchronous AI summary generation for one of your blog posts.")
    public ResponseEntity<Void> regenerateSummary(@PathVariable UUID id) {

        BlogPost blog = blogService.getMyBlogEntity(id); // ownership check

        asyncAiWorker.generateSummary(
                blog.getId(),
                blog.getContent()
        );

        return ResponseEntity.accepted().build();
    }

    /* ===================== CREATE ===================== */


    @PostMapping
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    @Operation(summary = "Create blog", description = "Creates a new blog draft for the authenticated user.")
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
    @Operation(summary = "Get my drafts", description = "Returns a paged list of the authenticated user's draft blogs.")
    public ResponseEntity<Page<BlogPostResponse>> getMyDrafts(
            Pageable pageable
    ) {
        return ResponseEntity.ok(blogService.getMyDrafts(pageable));
    }

    @GetMapping("/me/published")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    @Operation(summary = "Get my published blogs", description = "Returns a paged list of the authenticated user's published blogs.")
    public ResponseEntity<Page<BlogPostResponse>> getMyPublishedBlogs(
            Pageable pageable
    ) {
        return ResponseEntity.ok(blogService.getMyPublishedBlogs(pageable));
    }

    @GetMapping("/me/{blogId}")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    @Operation(summary = "Get my blog by id", description = "Fetches one of the authenticated user's blogs by id (draft or published).")
    public ResponseEntity<BlogPostResponse> getMyBlogById(
            @PathVariable UUID blogId
    ) {
        return ResponseEntity.ok(blogService.getMyBlogById(blogId));
    }

    /* ===================== READ (PUBLIC) ===================== */

    @GetMapping("/published")
    @Operation(summary = "List published blogs", description = "Returns a paged list of publicly visible published blogs.")
    public ResponseEntity<Page<BlogPostResponse>> getPublishedBlogs(
            Pageable pageable
    ) {
        return ResponseEntity.ok(blogService.getPublishedBlogs(pageable));
    }

    @GetMapping("/daily-thought")
    @Operation(summary = "List daily thoughts", description = "Returns a paged list of daily-thought posts (public).")
    public ResponseEntity<Page<BlogPostResponse>> getDailyThoughts(
            Pageable pageable
    ) {
        return ResponseEntity.ok(blogService.getDailyThoughts(pageable));
    }

    /* ===================== UPDATE ===================== */

    @PutMapping("/{blogId}")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    @Operation(summary = "Update draft", description = "Updates an existing draft blog owned by the authenticated user.")
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
    @Operation(summary = "Publish blog", description = "Publishes an existing draft blog owned by the authenticated user.")
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
    @Operation(summary = "Delete my blog", description = "Deletes a blog (draft or published) owned by the authenticated user.")
    public ResponseEntity<Void> deleteMyBlog(
            @PathVariable UUID blogId
    ) {
        blogService.deleteMyBlog(blogId);
        return ResponseEntity.noContent().build();
    }
}
