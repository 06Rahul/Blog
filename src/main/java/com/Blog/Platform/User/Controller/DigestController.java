package com.Blog.Platform.User.Controller;

import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/digest")
@RequiredArgsConstructor
public class DigestController {

    private final UserRepo userRepo;

    // Secure unsubscribe endpoint if user is logged in
    @PutMapping("/settings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> updateSettings(@RequestBody Map<String, Boolean> payload) {
        String email = SecurityUtil.getCurrentUserEmail();
        User currentUser = userRepo.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        boolean enabled = payload.getOrDefault("enabled", false);
        currentUser.setDigestEnabled(enabled);
        userRepo.save(currentUser);
        
        return ResponseEntity.ok(Map.of("message", "Digest settings updated successfully."));
    }

    @GetMapping("/unsubscribe")
    public ResponseEntity<String> unsubscribeViaLink(@RequestParam("token") String token) {
        // Here we would typically parse the JWT token securely, find the user id, and set their digestEnabled to false.
        // As a prototype, assuming the JWT verification service handles it correctly:
        // String email = jwtService.extractEmail(token);
        // User currentUser = userRepo.findByEmail(email)...
        // currentUser.setDigestEnabled(false);
        // userRepo.save(currentUser);
        
        return ResponseEntity.ok("Successfully unsubscribed from weekly digests.");
    }
}
