package com.Blog.Platform.Poll.Controller;

import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.Poll.DTO.PollCreateRequest;
import com.Blog.Platform.Poll.DTO.PollResultsDto;
import com.Blog.Platform.Poll.DTO.PollVoteRequest;
import com.Blog.Platform.Poll.Service.PollService;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/polls")
@RequiredArgsConstructor
public class PollController {

    private final PollService pollService;
    private final UserRepo userRepository;

    @PostMapping
    public ResponseEntity<UUID> createPoll(@RequestBody PollCreateRequest request) {
        return ResponseEntity.ok(pollService.createPoll(request));
    }

    @PostMapping("/{pollId}/vote")
    public ResponseEntity<PollResultsDto> vote(
            @PathVariable UUID pollId,
            @RequestBody PollVoteRequest request) {
        
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(pollService.vote(pollId, request, userId));
    }

    @GetMapping("/{pollId}/results")
    public ResponseEntity<PollResultsDto> getResults(@PathVariable UUID pollId) {
        UUID userId = null;
        try {
            userId = getCurrentUserId();
        } catch (Exception e) {
            // User might not be logged in or token missing, treat as guest
        }
        return ResponseEntity.ok(pollService.getResults(pollId, userId));
    }

    private UUID getCurrentUserId() {
        String email = SecurityUtil.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
