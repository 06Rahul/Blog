package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.Blog.DTO.CommentRequest;
import com.Blog.Platform.Blog.DTO.CommentResponse;
import com.Blog.Platform.Blog.ServiceImpl.EngagementService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/blogs")
public class EngagementController {

    private final EngagementService engagementService;

    public EngagementController(EngagementService engagementService) {
        this.engagementService = engagementService;
    }

    // Comments
    @PostMapping("/{blogId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID blogId,
            @RequestBody CommentRequest request) {
        return ResponseEntity.ok(engagementService.addComment(blogId, request));
    }

    @GetMapping("/{blogId}/comments")
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable UUID blogId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(engagementService.getComments(blogId, pageable));
    }

    // Likes
    @PostMapping("/{blogId}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable UUID blogId) {
        engagementService.toggleLike(blogId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{blogId}/likes")
    public ResponseEntity<Map<String, Object>> getLikeStatus(@PathVariable UUID blogId) {
        long count = engagementService.getLikeCount(blogId);
        boolean isLiked = engagementService.isLikedByCurrentUser(blogId);
        return ResponseEntity.ok(Map.of(
                "count", count,
                "isLiked", isLiked));
    }
}
