package com.Blog.Platform.User.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
@Tag(name = "Posts", description = "Post-related endpoints (authorization examples).")
public class PostController {

    @PreAuthorize("hasAnyRole('AUTHOR', 'ADMIN')")
    @GetMapping("/write")
    @Operation(summary = "Write post (demo)", description = "Authorization-gated endpoint for AUTHOR/ADMIN roles.")
    public ResponseEntity<String> writePost() {
        return ResponseEntity.ok("You can write posts");
    }
}
