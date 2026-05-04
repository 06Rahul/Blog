package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.Blog.Model.TagStat;
import com.Blog.Platform.Blog.Service.TrendingTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TrendingTagService trendingTagService;

    @GetMapping("/trending")
    public ResponseEntity<List<TagStat>> getTrendingTags(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(trendingTagService.getTrendingTags(limit));
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<TagStat>> autocompleteTags(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(trendingTagService.autocompleteTags(query, limit));
    }
}
