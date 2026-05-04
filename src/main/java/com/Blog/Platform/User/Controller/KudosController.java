package com.Blog.Platform.User.Controller;

import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import com.Blog.Platform.User.Service.VirtualKudosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/kudos")
@RequiredArgsConstructor
public class KudosController {

    private final VirtualKudosService kudosService;
    private final UserRepo userRepo;

    @GetMapping("/balance")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Integer>> getMyBalance() {
        String email = SecurityUtil.getCurrentUserEmail();
        User currentUser = userRepo.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        int balance = kudosService.getBalance(currentUser.getId());
        return ResponseEntity.ok(Map.of("balance", balance));
    }

    @PostMapping("/blogs/{id}/tip")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> tipBlog(@PathVariable UUID id, @RequestBody Map<String, Integer> payload) {
        Integer amount = payload.get("amount");
        if (amount == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Amount is required"));
        }
        
        try {
            kudosService.tipBlog(id, amount);
            return ResponseEntity.ok(Map.of("message", "Successfully tipped " + amount + " kudos!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
