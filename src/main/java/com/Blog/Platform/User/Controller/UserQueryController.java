package com.Blog.Platform.User.Controller;

import com.Blog.Platform.AiService.DTO.AiUsageResponse;
import com.Blog.Platform.AiService.ServiceImpl.AiUsageService;
import com.Blog.Platform.User.DTO.CustomUserDetails;
import com.Blog.Platform.User.DTO.UserProfileResponse;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserQueryController {

    private final UserService userService;
    private final AiUsageService aiUsageService;

    @GetMapping("/me")
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
    public ResponseEntity<User> getByUsername(@PathVariable String username) {

        Optional<User> user = userService.findByUsername(username);

        return user
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getByEmail(@PathVariable String email) {

        Optional<User> user = userService.findByEmail(email);

        return user
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
