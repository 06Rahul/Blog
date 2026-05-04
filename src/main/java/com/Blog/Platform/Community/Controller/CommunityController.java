package com.Blog.Platform.Community.Controller;

import com.Blog.Platform.Community.DTO.CommunityCreateRequest;
import com.Blog.Platform.Community.DTO.CommunityDTO;
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
        dto.setOwnerName(community.getOwner().getUsername());

        // Populate Member Count (Ideally cache this or use a count query)
        // For now, let's skip or do a count query if needed.
        // Assuming we want a quick implementation, we can separate member count or
        // fetch it.
        // community.getMembers().size() might be lazy and standard JPA doesn't have it
        // mapped as List in Entity.
        // So we might need memberRepository.countByCommunity(community)
        // For efficiency, let's leave 0 for now or add member count method.

        if (currentUser != null) {
            Optional<CommunityMember> member = memberRepository.findByCommunityAndUser(community, currentUser);
            member.ifPresent(m -> dto.setMyRole(m.getRole()));
        }

        return dto;
    }
}
