package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.DTO.PublicUserProfileResponse;
import com.Blog.Platform.User.Service.FollowService;
import com.Blog.Platform.Blog.Util.SecurityUtil;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/follows")
public class FollowsController {

    private final FollowService followService;

    public FollowsController(FollowService followService) {
        this.followService = followService;
    }

    @GetMapping("/followers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PublicUserProfileResponse>> getCurrentUserFollowers() {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        Page<PublicUserProfileResponse> followers = followService.getFollowers(currentUserId, PageRequest.of(0, 100));
        return ResponseEntity.ok(followers.getContent());
    }

    @GetMapping("/following")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PublicUserProfileResponse>> getCurrentUserFollowing() {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        Page<PublicUserProfileResponse> following = followService.getFollowing(currentUserId, PageRequest.of(0, 100));
        return ResponseEntity.ok(following.getContent());
    }
}
