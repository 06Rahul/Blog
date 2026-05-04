package com.Blog.Platform.AiService.Controller;

import com.Blog.Platform.AiService.Service.AiService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.Blog.Platform.Config.RateLimit;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiCoachController {

    private final AiService aiService;

    @RateLimit(requests = 10, windowSeconds = 60)
    @PostMapping("/coach")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<String> coachWriting(@RequestBody CoachRequest request) {
        String result = aiService.coachWriting(request.getText(), request.getAction());
        return ResponseEntity.ok(result);
    }

    @RateLimit(requests = 20, windowSeconds = 60)
    @PostMapping("/comment-reply")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<String> suggestCommentReply(@RequestBody CommentReplyRequest request) {
        String result = aiService.generateCommentReply(request.getCommentText(), request.getPostTitle());
        return ResponseEntity.ok(result);
    }

    @RateLimit(requests = 5, windowSeconds = 60)
    @PostMapping("/thumbnail")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<String> generateThumbnail(@RequestBody ThumbnailRequest request) {
        String result = aiService.generateThumbnail(request.getTitle(), request.getContent());
        return ResponseEntity.ok(result);
    }

    @Data
    public static class CoachRequest {
        private String text;
        private String action;
    }

    @Data
    public static class CommentReplyRequest {
        private String commentText;
        private String postTitle;
    }

    @Data
    public static class ThumbnailRequest {
        private String title;
        private String content;
    }
}
