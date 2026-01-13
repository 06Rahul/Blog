package com.Blog.UserService.Controller;

import com.Blog.UserService.DTO.CustomUserDetails;
import com.Blog.UserService.DTO.UserProfileResponse;
import com.Blog.UserService.Model.User;
import com.Blog.UserService.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserQueryController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(
            Authentication authentication
    ) {
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        return ResponseEntity.ok(
                new UserProfileResponse(
                        userDetails.getId(),
                        userDetails.getEmail(),
                        userDetails.getUsername(),
                        userDetails.getRole()
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
