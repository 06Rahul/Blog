package com.Blog.Platform.Discovery.Controller;

import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.Discovery.DTO.CommunityLeaderboardEntry;
import com.Blog.Platform.Discovery.DTO.CreatorLeaderboardEntry;
import com.Blog.Platform.Discovery.DTO.TrendingPostEntry;
import com.Blog.Platform.Discovery.Service.DiscoveryInsightsService;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryInsightsService discoveryInsightsService;
    private final UserRepo userRepo;

    @GetMapping("/leaderboards/creators")
    public ResponseEntity<List<CreatorLeaderboardEntry>> getCreatorLeaderboard(
            @RequestParam(defaultValue = "week") String window,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "false") boolean rising,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(discoveryInsightsService.getCreatorLeaderboard(window, categoryId, rising, limit));
    }

    @GetMapping("/leaderboards/communities")
    public ResponseEntity<List<CommunityLeaderboardEntry>> getCommunityLeaderboard(
            @RequestParam(defaultValue = "week") String window,
            @RequestParam(defaultValue = "false") boolean rising,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(discoveryInsightsService.getCommunityLeaderboard(window, rising, limit));
    }

    @GetMapping("/leaderboards/posts")
    public ResponseEntity<List<TrendingPostEntry>> getPostLeaderboard(
            @RequestParam(defaultValue = "week") String window,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(discoveryInsightsService.getTrendingPosts(window, categoryId, limit, tryGetCurrentUser()));
    }

    @GetMapping("/trending/posts")
    public ResponseEntity<List<TrendingPostEntry>> getTrendingPosts(
            @RequestParam(defaultValue = "week") String window,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(discoveryInsightsService.getTrendingPosts(window, categoryId, limit, tryGetCurrentUser()));
    }

    @GetMapping("/trending/people")
    public ResponseEntity<List<CreatorLeaderboardEntry>> getTrendingPeople(
            @RequestParam(defaultValue = "week") String window,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(discoveryInsightsService.getCreatorLeaderboard(window, null, false, limit));
    }

    @GetMapping("/trending/communities")
    public ResponseEntity<List<CommunityLeaderboardEntry>> getTrendingCommunities(
            @RequestParam(defaultValue = "week") String window,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(discoveryInsightsService.getCommunityLeaderboard(window, false, limit));
    }

    @GetMapping("/trending/feed")
    public ResponseEntity<Page<BlogPostResponse>> getTrendingFeed(
            @RequestParam(defaultValue = "week") String window,
            @RequestParam(required = false) UUID categoryId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(discoveryInsightsService.getTrendingPostPage(window, categoryId, pageable, tryGetCurrentUser()));
    }

    private User tryGetCurrentUser() {
        try {
            return userRepo.findById(SecurityUtil.getCurrentUserId()).orElse(null);
        } catch (Exception ignored) {
            return null;
        }
    }
}
