package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.AiService.ServiceImpl.AsyncAiWorker;
import com.Blog.Platform.Blog.DTO.BlogPostRequest;
import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Model.BlogPost;
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
        private final AsyncAiWorker asyncAiWorker;

        @PostMapping("/{id}/generate-summary")
        @PreAuthorize("hasAnyRole('AUTHOR','ADMIN')")
        public ResponseEntity<Void> regenerateSummary(@PathVariable UUID id) {

                BlogPost blog = blogService.getMyBlogEntity(id); // ownership check

                asyncAiWorker.generateSummary(
                                blog.getId(),
                                blog.getContent());

                return ResponseEntity.accepted().build();
        }

        /* ===================== CREATE ===================== */

        @PostMapping
        @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
        public ResponseEntity<BlogPostResponse> createBlog(
                        @Valid @RequestBody BlogPostRequest request) {
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(blogService.createBlog(request));
        }

        /* ===================== READ (MY BLOGS) ===================== */

        @GetMapping("/me/drafts")
        @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
        public ResponseEntity<Page<BlogPostResponse>> getMyDrafts(
                        Pageable pageable) {
                return ResponseEntity.ok(blogService.getMyDrafts(pageable));
        }

        @GetMapping("/me/published")
        @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
        public ResponseEntity<Page<BlogPostResponse>> getMyPublishedBlogs(
                        Pageable pageable) {
                return ResponseEntity.ok(blogService.getMyPublishedBlogs(pageable));
        }

        @GetMapping("/me/{blogId}")
        @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
        public ResponseEntity<BlogPostResponse> getMyBlogById(
                        @PathVariable UUID blogId) {
                return ResponseEntity.ok(blogService.getMyBlogById(blogId));
        }

        /* ===================== READ (PUBLIC) ===================== */

        @GetMapping("/published")
        public ResponseEntity<Page<BlogPostResponse>> getPublishedBlogs(
                        Pageable pageable) {
                return ResponseEntity.ok(blogService.getPublishedBlogs(pageable));
        }

        @GetMapping("/feed")
        public ResponseEntity<Page<BlogPostResponse>> getFeedBlogs(
                        Pageable pageable) {
                return ResponseEntity.ok(blogService.getFeedBlogs(pageable));
        }

        @GetMapping("/published/{id}")
        public ResponseEntity<BlogPostResponse> getPublishedBlogById(@PathVariable UUID id) {
                return ResponseEntity.ok(blogService.getPublishedBlogById(id));
        }

        @GetMapping("/search/unified")
        public ResponseEntity<Page<BlogPostResponse>> searchUnified(
                        @RequestParam String q, Pageable pageable) {
                return ResponseEntity.ok(blogService.searchBlogs(q, pageable));
        }

        /* ===================== UPDATE ===================== */

        @PutMapping("/{blogId}")
        @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
        public ResponseEntity<BlogPostResponse> updateDraft(
                        @PathVariable UUID blogId,
                        @Valid @RequestBody BlogPostRequest request) {
                return ResponseEntity.ok(
                                blogService.updateDraft(blogId, request));
        }

        /* ===================== PUBLISH ===================== */

        @PutMapping("/{blogId}/publish")
        @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
        public ResponseEntity<BlogPostResponse> publishBlog(
                        @PathVariable UUID blogId) {
                return ResponseEntity.ok(
                                blogService.publishBlog(blogId));
        }

        /* ===================== DELETE ===================== */

        @DeleteMapping("/{blogId}")
        @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
        public ResponseEntity<Void> deleteMyBlog(
                        @PathVariable UUID blogId) {
                blogService.deleteMyBlog(blogId);
                return ResponseEntity.noContent().build();
        }
}
