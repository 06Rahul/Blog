package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.Service.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserBlockController {

    private final BlockService blockService;

    @PostMapping("/{userId}/block")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<Void> blockUser(@PathVariable UUID userId) {
        blockService.blockUser(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/block")
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<Void> unblockUser(@PathVariable UUID userId) {
        blockService.unblockUser(userId);
        return ResponseEntity.noContent().build();
    }
}
