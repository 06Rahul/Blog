package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.User.DTO.PublicUserProfileResponse;
import com.Blog.Platform.User.Model.Follow;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.FollowRepository;
import com.Blog.Platform.User.Service.FollowService;
import com.Blog.Platform.User.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;
    private final UserService userService;
    private final com.Blog.Platform.User.Service.NotificationService notificationService;

    @Override
    public void followUser(UUID targetUserId) {
        User currentUser = userService.getCurrentUser();

        if (currentUser.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        User targetUser = userService.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (followRepository.existsByFollowerAndFollowing(currentUser, targetUser)) {
            throw new IllegalArgumentException("Already following this user");
        }

        Follow follow = new Follow(currentUser, targetUser);
        followRepository.save(follow);

        notificationService.createNotification(
                targetUser,
                currentUser,
                com.Blog.Platform.User.Model.NotificationType.FOLLOW,
                currentUser.getId().toString(),
                currentUser.getFirstName() + " started following you");
    }

    @Override
    public void unfollowUser(UUID targetUserId) {
        User currentUser = userService.getCurrentUser();

        User targetUser = userService.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        followRepository.deleteByFollowerAndFollowing(currentUser, targetUser);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFollowing(UUID targetUserId) {
        User currentUser = userService.getCurrentUser();
        User targetUser = userService.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return followRepository.existsByFollowerAndFollowing(currentUser, targetUser);
    }

    @Override
    @Transactional(readOnly = true)
    public long getFollowerCount(UUID userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return followRepository.countByFollowing(user);
    }

    @Override
    @Transactional(readOnly = true)
    public long getFollowingCount(UUID userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return followRepository.countByFollower(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PublicUserProfileResponse> getFollowers(UUID userId, Pageable pageable) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Page<Follow> follows = followRepository.findByFollowing(user, pageable);

        return follows.map(follow -> toPublicProfile(follow.getFollower()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PublicUserProfileResponse> getFollowing(UUID userId, Pageable pageable) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Page<Follow> follows = followRepository.findByFollower(user, pageable);

        return follows.map(follow -> toPublicProfile(follow.getFollowing()));
    }

    private PublicUserProfileResponse toPublicProfile(User user) {
        return PublicUserProfileResponse.builder()
                .id(user.getId())
                .username(user.getActualUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .bio(user.getBio())
                .profileImageUrl(user.getProfileImageUrl())
                .website(user.getWebsite())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<User> getFollowingUsers(UUID userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return followRepository.findByFollower(user).stream()
                .map(Follow::getFollowing)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<User> getFollowersList(UUID userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return followRepository.findByFollowing(user).stream()
                .map(Follow::getFollower)
                .collect(java.util.stream.Collectors.toList());
    }
}
