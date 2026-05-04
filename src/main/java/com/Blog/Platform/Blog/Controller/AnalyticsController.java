package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.Blog.DTO.AggregatedAnalyticsResponse;
import com.Blog.Platform.Blog.DTO.AnalyticsResponse;
import com.Blog.Platform.Blog.ServiceImpl.AnalyticsService;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepo userRepo;

    private User getCurrentUser() {
        String email = SecurityUtil.getCurrentUserEmail();
        return userRepo.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping("/blogs/{id}/analytics")
    @PreAuthorize("hasAnyRole('AUTHOR','ADMIN')")
    public ResponseEntity<AnalyticsResponse> getPostAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(analyticsService.getPostAnalytics(id, getCurrentUser()));
    }

    @GetMapping("/users/me/analytics")
    @PreAuthorize("hasAnyRole('AUTHOR','ADMIN')")
    public ResponseEntity<AggregatedAnalyticsResponse> getAggregatedAnalytics(
            @RequestParam(defaultValue = "30") int period) {
        return ResponseEntity.ok(analyticsService.getAggregatedAnalytics(getCurrentUser(), period));
    }
}
