package com.Blog.Platform.User.Controller;

import com.Blog.Platform.AiService.DTO.AiUsageResponse;
import com.Blog.Platform.AiService.ServiceImpl.AiUsageService;
import com.Blog.Platform.User.DTO.CustomUserDetails;
import com.Blog.Platform.User.DTO.ProfileUpdateRequest;
import com.Blog.Platform.User.DTO.UserProfileResponse;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Service.UserService;
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

        @GetMapping("/me")
        public ResponseEntity<UserProfileResponse> me(Authentication auth) {
                // Get full user entity to include all profile fields
                CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

                User user = userService.findById(userDetails.getId())
                                .orElseThrow(() -> new com.Blog.Platform.User.Excepction.UserNotFoundException(
                                                "User not found"));

                AiUsageResponse usage = aiUsageService.getTodayUsage();

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
                                                user.getRole().name(),
                                                user.isEmailVerified(),
                                                user.isMobileVerified(),
                                                usage.getUsed(),
                                                usage.getLimit()));
        }

        @GetMapping("/username/{username}")
        public ResponseEntity<com.Blog.Platform.User.DTO.PublicUserProfileResponse> getByUsername(
                        @PathVariable String username) {

                Optional<User> userOptional = userService.findByUsername(username);

                if (userOptional.isPresent()) {
                        User user = userOptional.get();
                        com.Blog.Platform.User.DTO.PublicUserProfileResponse response = com.Blog.Platform.User.DTO.PublicUserProfileResponse
                                        .builder()
                                        .id(user.getId())
                                        .username(user.getActualUsername())
                                        .firstName(user.getFirstName())
                                        .lastName(user.getLastName())
                                        .bio(user.getBio())
                                        .profileImageUrl(user.getProfileImageUrl())
                                        .website(user.getWebsite())
                                        .role(user.getRole() != null ? user.getRole().name() : "USER")
                                        .build();
                        return ResponseEntity.ok(response);
                }

                return ResponseEntity.notFound().build();
        }

        @GetMapping("/email/{email}")
        public ResponseEntity<User> getByEmail(@PathVariable String email) {

                Optional<User> user = userService.findByEmail(email);

                return user
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        /* ===================== PROFILE UPDATE ===================== */

        @PutMapping("/me")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<UserProfileResponse> updateProfile(
                        @Valid @RequestBody ProfileUpdateRequest request) {
                return ResponseEntity.ok(userService.updateProfile(request));
        }

        @PutMapping(value = "/me/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<UserProfileResponse> updateProfileImage(
                        @RequestParam("image") MultipartFile image) {
                return ResponseEntity.ok(userService.updateProfileImage(image));
        }
}
