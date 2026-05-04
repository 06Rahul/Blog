package com.Blog.Platform.AiService.Controller;

import com.Blog.Platform.AiService.Model.ModerationStatus;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.Comment;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/moderation")
@RequiredArgsConstructor
public class AdminModerationController {

    private final BlogPostRepository blogPostRepository;
    private final CommentRepository commentRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getModeratedContent(
            @RequestParam(defaultValue = "REJECTED") ModerationStatus status) {
        
        List<BlogPost> posts = blogPostRepository.findByModerationStatus(status);
        List<Comment> comments = commentRepository.findByModerationStatus(status);

        Map<String, Object> response = new HashMap<>();
        response.put("posts", posts);
        response.put("comments", comments);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/posts/{id}/override")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> overridePostModeration(
            @PathVariable UUID id,
            @RequestParam boolean approve) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        if (approve) {
            post.setModerationStatus(ModerationStatus.APPROVED);
            post.setModerationReason(null);
        } else {
            post.setModerationStatus(ModerationStatus.REJECTED);
        }
        
        blogPostRepository.save(post);
        return ResponseEntity.ok("Post moderation status updated.");
    }

    @PostMapping("/comments/{id}/override")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> overrideCommentModeration(
            @PathVariable UUID id,
            @RequestParam boolean approve) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        
        if (approve) {
            comment.setModerationStatus(ModerationStatus.APPROVED);
            comment.setModerationReason(null);
        } else {
            comment.setModerationStatus(ModerationStatus.REJECTED);
        }
        
        commentRepository.save(comment);
        return ResponseEntity.ok("Comment moderation status updated.");
    }
}
