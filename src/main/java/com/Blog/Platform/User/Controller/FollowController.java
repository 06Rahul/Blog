package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.DTO.ApiMessageResponse;
import com.Blog.Platform.User.DTO.PublicUserProfileResponse;
import com.Blog.Platform.User.Service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{id}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiMessageResponse> followUser(@PathVariable UUID id) {
        followService.followUser(id);
        return ResponseEntity.ok(new ApiMessageResponse("Successfully followed user"));
    }

    @DeleteMapping("/{id}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiMessageResponse> unfollowUser(@PathVariable UUID id) {
        followService.unfollowUser(id);
        return ResponseEntity.ok(new ApiMessageResponse("Successfully unfollowed user"));
    }

    @GetMapping("/{id}/is-following")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> isFollowing(@PathVariable UUID id) {
        return ResponseEntity.ok(followService.isFollowing(id));
    }

    @GetMapping("/{id}/followers/count")
    public ResponseEntity<Long> getFollowerCount(@PathVariable UUID id) {
        return ResponseEntity.ok(followService.getFollowerCount(id));
    }

    @GetMapping("/{id}/following/count")
    public ResponseEntity<Long> getFollowingCount(@PathVariable UUID id) {
        return ResponseEntity.ok(followService.getFollowingCount(id));
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<Page<PublicUserProfileResponse>> getFollowers(
            @PathVariable UUID id,
            Pageable pageable) {
        return ResponseEntity.ok(followService.getFollowers(id, pageable));
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<Page<PublicUserProfileResponse>> getFollowing(
            @PathVariable UUID id,
            Pageable pageable) {
        return ResponseEntity.ok(followService.getFollowing(id, pageable));
    }
}
