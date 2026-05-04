package com.Blog.Platform.Community.Controller;

import com.Blog.Platform.Community.DTO.CommunityCreateRequest;
import com.Blog.Platform.Community.DTO.CommunityDTO;
import com.Blog.Platform.Community.DTO.CommunityMemberDTO;
import com.Blog.Platform.Community.Model.Community;
import com.Blog.Platform.Community.Model.CommunityMember;
import com.Blog.Platform.Community.Model.CommunityRole;
import com.Blog.Platform.Community.Repository.CommunityMemberRepository;
import com.Blog.Platform.Community.Service.CommunityService;
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

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    @Autowired
    private CommunityService communityService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CommunityMemberRepository memberRepository;

    @PostMapping
    public ResponseEntity<CommunityDTO> createCommunity(@Valid @RequestBody CommunityCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Community community = communityService.createCommunity(request, user);
        return ResponseEntity.ok(convertToDTO(community, user));
    }

    @GetMapping
    public ResponseEntity<Page<CommunityDTO>> getAllCommunities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID category,
            @RequestParam(required = false, defaultValue = "false") boolean joined,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = null;
        if (userDetails != null) {
            user = userRepo.findByEmail(userDetails.getUsername()).orElse(null);
        }
        final User currentUser = user;

        Page<Community> communities = communityService.getAllCommunities(search, category, joined, currentUser,
                pageable);
        Page<CommunityDTO> dtos = communities.map(c -> convertToDTO(c, currentUser));

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/discover")
    public ResponseEntity<Page<CommunityDTO>> discoverCommunities(
            @RequestParam(defaultValue = "featured") String filter,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID category,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = null;
        if (userDetails != null) {
            user = userRepo.findByEmail(userDetails.getUsername()).orElse(null);
        }
        final User currentUser = user;
        Page<Community> communities = communityService.discoverCommunities(filter, search, category, currentUser, pageable);
        return ResponseEntity.ok(communities.map(c -> convertToDTO(c, currentUser)));
    }

    @GetMapping("/mine/joined")
    public ResponseEntity<Page<CommunityDTO>> getMyJoinedCommunities(
            @PageableDefault(sort = "joinedAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(communityService.getJoinedCommunities(user, pageable).map(c -> convertToDTO(c, user)));
    }

    @GetMapping("/mine/owned")
    public ResponseEntity<Page<CommunityDTO>> getMyOwnedCommunities(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(communityService.getOwnedCommunities(user, pageable).map(c -> convertToDTO(c, user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityDTO> getCommunity(@PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = null;
        if (userDetails != null) {
            user = userRepo.findByEmail(userDetails.getUsername()).orElse(null);
        }

        Community community = communityService.getCommunityById(id);
        return ResponseEntity.ok(convertToDTO(community, user));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinCommunity(@PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        communityService.joinCommunity(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveCommunity(@PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        communityService.leaveCommunity(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<java.util.List<CommunityMemberDTO>> getMembers(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(communityService.getMembers(id, user));
    }

    @PostMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> addMember(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User requester = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        communityService.addMember(id, userId, requester);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User requester = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        communityService.removeMember(id, userId, requester);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/members/{userId}/role")
    public ResponseEntity<Void> assignRole(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @RequestParam CommunityRole role,
            @AuthenticationPrincipal UserDetails userDetails) {
        User requester = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        communityService.assignRole(id, userId, role, requester);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/rules")
    public ResponseEntity<Void> updateRules(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        User requester = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        communityService.updateRules(id, payload.get("rules"), requester);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/join/accept/{userId}")
    public ResponseEntity<Void> acceptJoinRequest(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        communityService.acceptJoinRequest(id, userId, admin);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/join/reject/{userId}")
    public ResponseEntity<Void> rejectJoinRequest(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        communityService.rejectJoinRequest(id, userId, admin);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/invite/accept")
    public ResponseEntity<Void> acceptInvite(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        communityService.acceptInvite(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/invite/reject")
    public ResponseEntity<Void> rejectInvite(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        communityService.rejectInvite(id, user);
        return ResponseEntity.ok().build();
    }

    // Helper to convert Entity to DTO
    private CommunityDTO convertToDTO(Community community, User currentUser) {
        CommunityDTO dto = new CommunityDTO();
        dto.setId(community.getId());
        dto.setName(community.getName());
        dto.setDescription(community.getDescription());
        dto.setVisibility(community.getVisibility());
        dto.setStatus(community.getStatus());
        dto.setRules(community.getRules());
        dto.setCreatedAt(community.getCreatedAt());

        if (community.getCategory() != null) {
            dto.setCategoryName(community.getCategory().getName());
        }

        dto.setOwnerId(community.getOwner().getId());
        dto.setOwnerName(community.getOwner().getActualUsername());

        dto.setMemberCount(memberRepository.countByCommunity(community));

        if (currentUser != null) {
            Optional<CommunityMember> member = memberRepository.findByCommunityAndUser(community, currentUser);
            member.ifPresent(m -> {
                dto.setMyRole(m.getRole());
                dto.setMyStatus(m.getStatus());
            });
        }

        return dto;
    }
}
