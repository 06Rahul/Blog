package com.Blog.Platform.User.Controller;

import com.Blog.Platform.AiService.DTO.AiUsageResponse;
import com.Blog.Platform.AiService.ServiceImpl.AiUsageService;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.BlogStatus;
import com.Blog.Platform.Blog.Model.Comment;
import com.Blog.Platform.Blog.Repo.AnalyticsRepository;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Repository.CommentRepository;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.Community.Model.CommunityMember;
import com.Blog.Platform.Community.Model.CommunityMemberStatus;
import com.Blog.Platform.Community.Repository.CommunityMemberRepository;
import com.Blog.Platform.Community.Repository.CommunityRepository;
import com.Blog.Platform.User.DTO.CustomUserDetails;
import com.Blog.Platform.User.DTO.ProfileActivityItemResponse;
import com.Blog.Platform.User.DTO.ProfileTopPostResponse;
import com.Blog.Platform.User.DTO.ProfileUpdateRequest;
import com.Blog.Platform.User.DTO.PublicUserProfileResponse;
import com.Blog.Platform.User.DTO.UserProfileResponse;
import com.Blog.Platform.User.DTO.UsernameAvailabilityResponse;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.FollowRepository;
import com.Blog.Platform.User.Repo.SavedBlogRepository;
import com.Blog.Platform.User.Service.AuthService;
import com.Blog.Platform.User.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserQueryController {

    private final AuthService authService;
    private final UserService userService;
    private final AiUsageService aiUsageService;
    private final FollowRepository followRepository;
    private final BlogPostRepository blogPostRepository;
    private final AnalyticsRepository analyticsRepository;
    private final CommentRepository commentRepository;
    private final SavedBlogRepository savedBlogRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final CommunityRepository communityRepository;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication auth) {
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        User user = userService.findById(userDetails.getId())
                .orElseThrow(() -> new com.Blog.Platform.User.Excepction.UserNotFoundException("User not found"));

        AiUsageResponse usage = aiUsageService.getTodayUsage(user);

        long followerCount = followRepository.countByFollowing(user);
        long followingCount = followRepository.countByFollower(user);
        long postCount = blogPostRepository.countByAuthorAndStatus(user, BlogStatus.PUBLISHED);
        long draftCount = blogPostRepository.countByAuthorAndStatus(user, BlogStatus.DRAFT);
        long savedCount = savedBlogRepository.countByUser(user);
        long joinedCount = communityMemberRepository.countByUserAndStatus(user, com.Blog.Platform.Community.Model.CommunityMemberStatus.ACCEPTED);
        long createdCount = communityRepository.countByOwner_Id(user.getId());

        return ResponseEntity.ok(
                new UserProfileResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getActualUsername(),
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
                        followingCount,
                        postCount,
                        draftCount,
                        savedCount,
                        joinedCount,
                        createdCount
                )
        );
    }

    @GetMapping("/me/top-post")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileTopPostResponse> getMyTopPost(Authentication auth) {
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        User user = userService.findById(userDetails.getId())
                .orElseThrow(() -> new com.Blog.Platform.User.Excepction.UserNotFoundException("User not found"));

        return analyticsRepository.getTopPostForAuthor(user.getId(), LocalDateTime.now().minusDays(30), org.springframework.data.domain.PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .map(topPost -> ResponseEntity.ok(new ProfileTopPostResponse(
                        topPost.getBlogId(),
                        topPost.getTitle(),
                        topPost.getViews() == null ? 0 : topPost.getViews()
                )))
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/me/activity")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProfileActivityItemResponse>> getMyActivity(
            Authentication auth,
            @RequestParam(defaultValue = "8") int limit
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        User user = userService.findById(userDetails.getId())
                .orElseThrow(() -> new com.Blog.Platform.User.Excepction.UserNotFoundException("User not found"));

        int pageSize = Math.min(Math.max(limit, 1), 20);
        List<ProfileActivityItemResponse> activity = new ArrayList<>();

        for (BlogPost blog : blogPostRepository.findByAuthorOrderByCreatedAtDesc(user, PageRequest.of(0, pageSize)).getContent()) {
            String actionLabel = switch (blog.getStatus()) {
                case DRAFT -> "Saved a draft";
                case SCHEDULED -> "Scheduled a post";
                case PUBLISHED -> "Published a post";
            };
            activity.add(new ProfileActivityItemResponse(
                    "post",
                    actionLabel,
                    blog.getTitle(),
                    blog.getId(),
                    "/blogs/" + blog.getId(),
                    blog.getCreatedAt()
            ));
        }

        for (Comment comment : commentRepository.findByAuthorOrderByCreatedAtDesc(user, PageRequest.of(0, pageSize)).getContent()) {
            if (comment.getBlog() == null) {
                continue;
            }
            activity.add(new ProfileActivityItemResponse(
                    "comment",
                    "Commented on a post",
                    comment.getBlog().getTitle(),
                    comment.getBlog().getId(),
                    "/blogs/" + comment.getBlog().getId(),
                    comment.getCreatedAt()
            ));
        }

        for (CommunityMember membership : communityMemberRepository.findByUserAndStatusOrderByJoinedAtDesc(user, CommunityMemberStatus.ACCEPTED, PageRequest.of(0, pageSize)).getContent()) {
            if (membership.getCommunity() == null) {
                continue;
            }
            boolean isOwner = membership.getCommunity().getOwner() != null
                    && membership.getCommunity().getOwner().getId().equals(user.getId());
            activity.add(new ProfileActivityItemResponse(
                    "community",
                    isOwner ? "Created a community" : "Joined a community",
                    membership.getCommunity().getName(),
                    membership.getCommunity().getId(),
                    "/communities/" + membership.getCommunity().getId(),
                    membership.getJoinedAt()
            ));
        }

        return ResponseEntity.ok(activity.stream()
                .filter(item -> item.happenedAt() != null)
                .sorted(Comparator.comparing(ProfileActivityItemResponse::happenedAt).reversed())
                .limit(pageSize)
                .toList());
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

    @GetMapping("/username-availability")
    public ResponseEntity<UsernameAvailabilityResponse> checkUsernameAvailability(
            @RequestParam String username) {
        return ResponseEntity.ok(authService.checkUsernameAvailability(username));
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
            // Unauthenticated request, flags stay false.
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
