package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.Blog.Service.CoauthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coauthors")
@RequiredArgsConstructor
public class CoauthorController {

    private final CoauthorService coauthorService;

    @GetMapping("/accept")
    public ResponseEntity<String> acceptInvitation(@RequestParam("token") String token) {
        coauthorService.accept(token);
        return ResponseEntity.ok("Invitation accepted successfully.");
    }

    @GetMapping("/decline")
    public ResponseEntity<String> declineInvitation(@RequestParam("token") String token) {
        coauthorService.decline(token);
        return ResponseEntity.ok("Invitation declined.");
    }
}
