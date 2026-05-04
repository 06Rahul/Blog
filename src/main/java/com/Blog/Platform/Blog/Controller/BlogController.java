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
    private final com.Blog.Platform.Blog.ServiceImpl.RecommendationService recommendationService;
    private final com.Blog.Platform.Blog.ServiceImpl.PostViewService postViewService;
    private final com.Blog.Platform.Blog.Service.CoauthorService coauthorService;
    private final com.Blog.Platform.Blog.Repository.PostCoauthorRepository coauthorRepo;

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> recordView(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Session-ID") String sessionId,
            @RequestBody(required = false) com.Blog.Platform.Blog.DTO.ViewRequest request) {
        
        String referrer = request != null ? request.referrer() : null;
        UUID userId = null;
        try {
            userId = com.Blog.Platform.Blog.Util.SecurityUtil.getCurrentUserId();
        } catch (Exception e) {
            // Unauthenticated
        }
        
        postViewService.recordView(id, userId, sessionId, referrer);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<java.util.List<BlogPostResponse>> getRecommendations(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(recommendationService.getRecommendations(id, limit));
    }

    @PostMapping("/{id}/generate-summary")
    @PreAuthorize("hasAnyRole('AUTHOR','ADMIN')")
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
    public ResponseEntity<BlogPostResponse> createBlog(
            @Valid @RequestBody BlogPostRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(blogService.createBlog(request));
    }

    /* ===================== READ (MY BLOGS) ===================== */

    @GetMapping("/feed")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<Page<BlogPostResponse>> getRelevanceFeed(Pageable pageable) {
        return ResponseEntity.ok(blogService.getRelevanceFeed(pageable));
    }

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
            @RequestParam(required = false) UUID categoryId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(blogService.getPublishedBlogs(categoryId, pageable));
    }

    @GetMapping("/published/{blogId}")
    public ResponseEntity<BlogPostResponse> getPublishedBlogById(
            @PathVariable UUID blogId
    ) {
        return ResponseEntity.ok(blogService.getPublishedBlogById(blogId));
    }

    @GetMapping("/published/following")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<BlogPostResponse>> getFollowingFeed(Pageable pageable) {
        return ResponseEntity.ok(blogService.getFollowingFeed(pageable));
    }

    @GetMapping("/published/trending")
    public ResponseEntity<Page<BlogPostResponse>> getTrendingFeed(Pageable pageable) {
        return ResponseEntity.ok(blogService.getTrendingFeed(pageable));
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

    @PutMapping("/{blogId}/schedule")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<BlogPostResponse> schedulePost(
            @PathVariable UUID blogId, 
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime publishAt) {
        return ResponseEntity.ok(blogService.schedulePost(blogId, publishAt));
    }

    @DeleteMapping("/{blogId}/schedule")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<BlogPostResponse> cancelSchedule(@PathVariable UUID blogId) {
        return ResponseEntity.ok(blogService.cancelSchedule(blogId));
    }

    @GetMapping("/me/scheduled")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<Page<BlogPostResponse>> getMyScheduledBlogs(
            @org.springframework.data.web.PageableDefault(size = 10, sort = "publishAt", direction = org.springframework.data.domain.Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(blogService.getMyScheduledBlogs(pageable));
    }

    /* ===================== COAUTHORS ===================== */

    @PostMapping("/{blogId}/coauthors")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<Void> inviteCoauthor(
            @PathVariable UUID blogId,
            @RequestBody com.Blog.Platform.Blog.DTO.CoauthorInviteRequest request) {
        
        UUID currentUserId = ((com.Blog.Platform.Blog.ServiceImpl.BlogServiceImpl)blogService).getCurrentUser().getId();
        coauthorService.invite(blogId, request.userId(), currentUserId);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping("/{blogId}/coauthors/{userId}")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<Void> removeCoauthor(
            @PathVariable UUID blogId,
            @PathVariable UUID userId) {
        
        UUID currentUserId = ((com.Blog.Platform.Blog.ServiceImpl.BlogServiceImpl)blogService).getCurrentUser().getId();
        coauthorService.remove(blogId, userId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{blogId}/coauthors")
    public ResponseEntity<java.util.List<com.Blog.Platform.Blog.DTO.CoauthorDto>> getCoauthors(@PathVariable UUID blogId) {
        var list = coauthorRepo.findByBlogIdAndStatus(blogId, com.Blog.Platform.Blog.Model.CoauthorStatus.ACCEPTED)
            .stream()
            .map(c -> new com.Blog.Platform.Blog.DTO.CoauthorDto(c.getSubjectUser().getId(), c.getSubjectUser().getActualUsername()))
            .toList();
        return ResponseEntity.ok(list);
    }
}
