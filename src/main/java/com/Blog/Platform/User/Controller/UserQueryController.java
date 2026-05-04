package com.Blog.Platform.User.Controller;

import com.Blog.Platform.AiService.DTO.AiUsageResponse;
import com.Blog.Platform.AiService.ServiceImpl.AiUsageService;
import com.Blog.Platform.User.DTO.CustomUserDetails;
import com.Blog.Platform.User.DTO.UserProfileResponse;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and lookup endpoints.")
public class UserQueryController {

    private final UserService userService;
    private final AiUsageService aiUsageService;

    @GetMapping("/me")
    @Operation(summary = "Get my profile", description = "Returns the authenticated user's profile along with today's AI usage.")
    public ResponseEntity<UserProfileResponse> me(Authentication auth) {

        CustomUserDetails user =
                (CustomUserDetails) auth.getPrincipal();

        AiUsageResponse usage =
                aiUsageService.getTodayUsage();

        return ResponseEntity.ok(
                new UserProfileResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getUsername(),
                        user.getRole(),
                        usage.getUsed(),
                        usage.getLimit()
                )
        );
    }


    @GetMapping("/username/{username}")
    @Operation(summary = "Get user by username", description = "Fetches a user by their username.")
    public ResponseEntity<User> getByUsername(@PathVariable String username) {

        Optional<User> user = userService.findByUsername(username);

        return user
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get user by email", description = "Fetches a user by their email address.")
    public ResponseEntity<User> getByEmail(@PathVariable String email) {

        Optional<User> user = userService.findByEmail(email);

        return user
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
