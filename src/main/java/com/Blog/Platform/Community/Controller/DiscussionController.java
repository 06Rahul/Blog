package com.Blog.Platform.Community.Controller;

import com.Blog.Platform.Community.DTO.ReplyCreateRequest;
import com.Blog.Platform.Community.DTO.ReplyDTO;
import com.Blog.Platform.Community.DTO.ThreadCreateRequest;
import com.Blog.Platform.Community.DTO.ThreadDTO;
import com.Blog.Platform.Community.Model.DiscussionThread;
import com.Blog.Platform.Community.Model.ThreadReply;
import com.Blog.Platform.Community.Service.DiscussionService;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DiscussionController {

    @Autowired
    private DiscussionService discussionService;

    @Autowired
    private UserRepo userRepo;

    @PostMapping("/communities/{communityId}/threads")
    public ResponseEntity<ThreadDTO> createThread(@PathVariable UUID communityId,
            @Valid @RequestBody ThreadCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        request.setCommunityId(communityId);
        DiscussionThread thread = discussionService.createThread(request, user);
        return ResponseEntity.ok(convertThreadToDTO(thread));
    }

    @GetMapping("/communities/{communityId}/threads")
    public ResponseEntity<Page<ThreadDTO>> getCommunityThreads(
            @PathVariable UUID communityId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<DiscussionThread> threads = discussionService.getThreadsByCommunity(communityId, pageable);
        return ResponseEntity.ok(threads.map(this::convertThreadToDTO));
    }

    @GetMapping("/threads/{threadId}")
    public ResponseEntity<ThreadDTO> getThread(@PathVariable UUID threadId) {
        DiscussionThread thread = discussionService.getThread(threadId);
        return ResponseEntity.ok(convertThreadToDTO(thread));
    }

    @PostMapping("/threads/{threadId}/replies")
    public ResponseEntity<ReplyDTO> createReply(@PathVariable UUID threadId,
            @Valid @RequestBody ReplyCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ThreadReply reply = discussionService.createReply(request, threadId, user);
        return ResponseEntity.ok(convertReplyToDTO(reply));
    }

    private ThreadDTO convertThreadToDTO(DiscussionThread thread) {
        ThreadDTO dto = new ThreadDTO();
        dto.setId(thread.getId());
        dto.setTitle(thread.getTitle());
        dto.setContent(thread.getContent());
        dto.setAuthorId(thread.getAuthor().getId());
        dto.setAuthorName(thread.getAuthor().getActualUsername());
        dto.setAuthorImage(thread.getAuthor().getProfileImageUrl());
        dto.setCommunityId(thread.getCommunity().getId());
        dto.setCommunityName(thread.getCommunity().getName());
        dto.setStatus(thread.getStatus());
        dto.setPinned(thread.isPinned());
        dto.setViewCount(thread.getViewCount());
        dto.setCreatedAt(thread.getCreatedAt());
        // Reply count?
        return dto;
    }

    private ReplyDTO convertReplyToDTO(ThreadReply reply) {
        ReplyDTO dto = new ReplyDTO();
        dto.setId(reply.getId());
        dto.setContent(reply.getContent());
        dto.setAuthorId(reply.getAuthor().getId());
        dto.setAuthorName(reply.getAuthor().getActualUsername());
        dto.setAuthorImage(reply.getAuthor().getProfileImageUrl());
        dto.setCreatedAt(reply.getCreatedAt());

        if (reply.getReplies() != null && !reply.getReplies().isEmpty()) {
            dto.setReplies(reply.getReplies().stream()
                    .map(this::convertReplyToDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    @GetMapping("/threads/{threadId}/replies")
    public ResponseEntity<Page<ReplyDTO>> getThreadReplies(
            @PathVariable UUID threadId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<ThreadReply> replies = discussionService.getThreadReplies(threadId, pageable);
        return ResponseEntity.ok(replies.map(this::convertReplyToDTO));
    }

    @PutMapping("/threads/{threadId}")
    public ResponseEntity<ThreadDTO> updateThread(@PathVariable UUID threadId,
            @Valid @RequestBody ThreadCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        DiscussionThread thread = discussionService.updateThread(threadId, request, user);
        return ResponseEntity.ok(convertThreadToDTO(thread));
    }

    @DeleteMapping("/threads/{threadId}")
    public ResponseEntity<Void> deleteThread(@PathVariable UUID threadId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        discussionService.deleteThread(threadId, user);
        return ResponseEntity.noContent().build();
    }
}
