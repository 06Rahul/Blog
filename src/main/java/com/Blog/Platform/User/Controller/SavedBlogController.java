package com.Blog.Platform.User.Controller;

import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.User.Service.SavedBlogService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/saved-blogs")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SavedBlogController {

    private final SavedBlogService savedBlogService;

    public SavedBlogController(SavedBlogService savedBlogService) {
        this.savedBlogService = savedBlogService;
    }

    @PostMapping("/{blogId}")
    public ResponseEntity<?> saveBlog(@PathVariable UUID blogId) {
        savedBlogService.saveBlog(blogId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{blogId}")
    public ResponseEntity<?> unsaveBlog(@PathVariable UUID blogId) {
        savedBlogService.unsaveBlog(blogId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{blogId}/is-saved")
    public ResponseEntity<Boolean> isSaved(@PathVariable UUID blogId) {
        return ResponseEntity.ok(savedBlogService.isSaved(blogId));
    }

    @GetMapping
    public ResponseEntity<Page<BlogPostResponse>> getSavedBlogs(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(savedBlogService.getSavedBlogs(pageable));
    }
}
