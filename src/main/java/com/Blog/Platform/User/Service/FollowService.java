package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.DTO.PublicUserProfileResponse;
import com.Blog.Platform.User.Model.Follow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface FollowService {
    void followUser(UUID targetUserId);

    void unfollowUser(UUID targetUserId);

    boolean isFollowing(UUID targetUserId);

    long getFollowerCount(UUID userId);

    long getFollowingCount(UUID userId);

    Page<PublicUserProfileResponse> getFollowers(UUID userId, Pageable pageable);

    Page<PublicUserProfileResponse> getFollowing(UUID userId, Pageable pageable);

    java.util.List<com.Blog.Platform.User.Model.User> getFollowingUsers(UUID userId);

    java.util.List<com.Blog.Platform.User.Model.User> getFollowersList(UUID userId);
}
