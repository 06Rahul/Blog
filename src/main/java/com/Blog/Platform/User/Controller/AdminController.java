package com.Blog.Platform.User.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin-only endpoints.")
public class AdminController {

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin-only")
    @Operation(summary = "Admin-only check", description = "Simple endpoint to verify ADMIN role access.")
    public ResponseEntity<String> adminOnly() {
        return ResponseEntity.ok("Admin access granted");
    }
}
