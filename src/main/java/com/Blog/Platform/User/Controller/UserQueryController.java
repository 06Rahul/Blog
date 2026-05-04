package com.Blog.Platform.User.Controller;

import com.Blog.Platform.AiService.DTO.AiUsageResponse;
import com.Blog.Platform.AiService.ServiceImpl.AiUsageService;
import com.Blog.Platform.User.DTO.CustomUserDetails;
import com.Blog.Platform.User.DTO.ProfileUpdateRequest;
import com.Blog.Platform.User.DTO.UserProfileResponse;
import com.Blog.Platform.User.DTO.PublicUserProfileResponse;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Service.UserService;
import com.Blog.Platform.User.Repo.FollowRepository;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Model.BlogStatus;
import com.Blog.Platform.Community.Repository.CommunityMemberRepository;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserQueryController {

    private final UserService userService;
    private final AiUsageService aiUsageService;
    private final FollowRepository followRepository;
    private final BlogPostRepository blogPostRepository;
    private final CommunityMemberRepository communityMemberRepository;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication auth) {
        // Get full user entity to include all profile fields
        CustomUserDetails userDetails =
                (CustomUserDetails) auth.getPrincipal();
        
        User user = userService.findById(userDetails.getId())
                .orElseThrow(() -> new com.Blog.Platform.User.Excepction.UserNotFoundException("User not found"));

        AiUsageResponse usage =
                aiUsageService.getTodayUsage();

        long followerCount = followRepository.countByFollowing(user);
        long followingCount = followRepository.countByFollower(user);

        return ResponseEntity.ok(
                new UserProfileResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getUsername(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getBio(),
                        user.getWebsite(),
                        user.getMobileNumber(),
                        user.getProfileImageUrl(),
                        user.getBannerImageUrl(),
                        user.getContactInfo(),
                        user.getInterests(),
                        user.getRole().name(),
                        user.isEmailVerified(),
                        user.isMobileVerified(),
                        usage.getUsed(),
                        usage.getLimit(),
                        followerCount,
                        followingCount
                )
        );
    }


    @GetMapping("/username/{username}")
    public ResponseEntity<PublicUserProfileResponse> getByUsername(@PathVariable String username) {
        Optional<User> userOpt = userService.findByUsername(username);

        return userOpt
                .map(user -> ResponseEntity.ok(buildPublicProfile(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<PublicUserProfileResponse> getByEmail(@PathVariable String email) {
        Optional<User> userOpt = userService.findByEmail(email);

        return userOpt
                .map(user -> ResponseEntity.ok(buildPublicProfile(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<java.util.List<PublicUserProfileResponse>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(userService.searchUsers(query, limit));
    }

    private PublicUserProfileResponse buildPublicProfile(User user) {
        long followerCount = followRepository.countByFollowing(user);
        long followingCount = followRepository.countByFollower(user);
        long postCount = blogPostRepository.countByAuthorAndStatus(user, BlogStatus.PUBLISHED);
        long communityCount = communityMemberRepository.countByUser(user);

        boolean isFollowing = false;
        boolean isFollowedBy = false;

        try {
            String currentEmail = SecurityUtil.getCurrentUserEmail();
            if (currentEmail != null) {
                Optional<User> currentUserOpt = userService.findByEmail(currentEmail);
                if (currentUserOpt.isPresent()) {
                    User currentUser = currentUserOpt.get();
                    isFollowing = followRepository.existsByFollowerAndFollowing(currentUser, user);
                    isFollowedBy = followRepository.existsByFollowerAndFollowing(user, currentUser);
                }
            }
        } catch (Exception e) {
            // Unauthenticated request, flags stay false
        }

        return PublicUserProfileResponse.builder()
                .id(user.getId())
                .username(user.getActualUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .bio(user.getBio())
                .profileImageUrl(user.getProfileImageUrl())
                .bannerImageUrl(user.getBannerImageUrl())
                .website(user.getWebsite())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .followerCount(followerCount)
                .followingCount(followingCount)
                .postCount(postCount)
                .communityCount(communityCount)
                .isFollowingCurrentUser(isFollowedBy)
                .isFollowedByCurrentUser(isFollowing)
                .build();
    }

    /* ===================== PROFILE UPDATE ===================== */

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PutMapping(value = "/me/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateProfileImage(
            @RequestParam("image") MultipartFile image
    ) {
        return ResponseEntity.ok(userService.updateProfileImage(image));
    }
}
