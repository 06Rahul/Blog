package com.Blog.Platform.Community.Service;

import com.Blog.Platform.Blog.Model.Category;
import com.Blog.Platform.Blog.Repo.CategoryRepository;
import com.Blog.Platform.Community.DTO.CommunityCreateRequest;
import com.Blog.Platform.Community.DTO.CommunityMemberDTO;
import com.Blog.Platform.Community.Model.*;
import com.Blog.Platform.Community.Repository.CommunityMemberRepository;
import com.Blog.Platform.Community.Repository.CommunityRepository;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class CommunityService {

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private CommunityMemberRepository memberRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepo userRepo;

    @Transactional
    public Community createCommunity(CommunityCreateRequest request, User owner) {
        if (communityRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Community name already exists");
        }

        Community community = new Community();
        community.setName(request.getName());
        community.setDescription(request.getDescription());
        community.setVisibility(request.getVisibility());
        community.setRules(request.getRules());
        community.setOwner(owner);
        community.setStatus(CommunityStatus.ACTIVE);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            community.setCategory(category);
        }

        Community savedCommunity = communityRepository.save(community);

        // Add owner as member with OWNER role
        CommunityMember member = new CommunityMember();
        member.setCommunity(savedCommunity);
        member.setUser(owner);
        member.setRole(CommunityRole.OWNER);
        member.setStatus(CommunityMemberStatus.ACCEPTED);
        memberRepository.save(member);

        return savedCommunity;
    }

    public Page<Community> getAllCommunities(String search, UUID categoryId, boolean onlyJoined, User currentUser,
            Pageable pageable) {
        if (onlyJoined && currentUser != null) {
            return communityRepository.findJoinedCommunities(currentUser, pageable);
        }

        if (search != null && !search.isEmpty() && categoryId != null) {
            return communityRepository.findByNameContainingIgnoreCaseAndCategory_Id(search, categoryId, pageable);
        } else if (search != null && !search.isEmpty()) {
            return communityRepository.findByNameContainingIgnoreCase(search, pageable);
        } else if (categoryId != null) {
            return communityRepository.findByCategory_Id(categoryId, pageable);
        }
        return communityRepository.findAll(pageable);
    }

    public Community getCommunityById(UUID id) {
        return communityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));
    }

    public Page<Community> getCommunitiesByCategory(UUID categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        return communityRepository.findByCategory(category, pageable);
    }

    @Transactional
    public void joinCommunity(UUID communityId, User user) {
        Community community = getCommunityById(communityId);

        Optional<CommunityMember> existing = memberRepository.findByCommunityAndUser(community, user);
        if (existing.isPresent()) {
            CommunityMember member = existing.get();
            if (member.getStatus() == CommunityMemberStatus.REJECTED) {
                member.setStatus(CommunityMemberStatus.PENDING);
                memberRepository.save(member);
                return;
            }
            throw new IllegalArgumentException("User is already a member or has a pending request");
        }

        CommunityMember member = new CommunityMember();
        member.setCommunity(community);
        member.setUser(user);
        member.setRole(CommunityRole.MEMBER);
        
        if (community.getVisibility() == CommunityVisibility.PRIVATE) {
            member.setStatus(CommunityMemberStatus.PENDING);
        } else {
            member.setStatus(CommunityMemberStatus.ACCEPTED);
        }
        memberRepository.save(member);
    }

    @Transactional
    public void leaveCommunity(UUID communityId, User user) {
        Community community = getCommunityById(communityId);

        CommunityMember member = memberRepository.findByCommunityAndUser(community, user)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this community"));

        if (member.getRole() == CommunityRole.OWNER) {
            throw new IllegalArgumentException(
                    "Owner cannot leave the community. Transfer ownership or delete community.");
        }

        memberRepository.delete(member);
    }

    public boolean isMember(UUID communityId, User user) {
        Community community = communityRepository.findById(communityId).orElse(null);
        if (community == null)
            return false;
        return memberRepository.existsByCommunityAndUser(community, user);
    }

    public java.util.List<CommunityMemberDTO> getMembers(UUID communityId, User requester) {
        Community community = getCommunityById(communityId);
        ensureAdmin(community, requester);

        return memberRepository.findByCommunity(community).stream()
                .map(member -> {
                    CommunityMemberDTO dto = new CommunityMemberDTO();
                    dto.setUserId(member.getUser().getId());
                    dto.setUsername(member.getUser().getActualUsername());
                    dto.setProfileImageUrl(member.getUser().getProfileImageUrl());
                    dto.setRole(member.getRole());
                    dto.setStatus(member.getStatus());
                    dto.setJoinedAt(member.getJoinedAt());
                    return dto;
                })
                .toList();
    }

    @Transactional
    public void addMember(UUID communityId, UUID userId, User requester) {
        Community community = getCommunityById(communityId);
        ensureAdmin(community, requester);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (memberRepository.existsByCommunityAndUser(community, user)) {
            return;
        }

        CommunityMember member = new CommunityMember();
        member.setCommunity(community);
        member.setUser(user);
        member.setRole(CommunityRole.MEMBER);
        member.setStatus(CommunityMemberStatus.INVITED);
        memberRepository.save(member);
    }

    @Transactional
    public void acceptJoinRequest(UUID communityId, UUID userId, User admin) {
        Community community = getCommunityById(communityId);
        ensureAdmin(community, admin);
        CommunityMember member = memberRepository.findByCommunityAndUser(community, userRepo.findById(userId).orElseThrow())
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        if (member.getStatus() != CommunityMemberStatus.PENDING) {
            throw new IllegalArgumentException("No pending request found");
        }
        member.setStatus(CommunityMemberStatus.ACCEPTED);
        memberRepository.save(member);
    }

    @Transactional
    public void rejectJoinRequest(UUID communityId, UUID userId, User admin) {
        Community community = getCommunityById(communityId);
        ensureAdmin(community, admin);
        CommunityMember member = memberRepository.findByCommunityAndUser(community, userRepo.findById(userId).orElseThrow())
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        member.setStatus(CommunityMemberStatus.REJECTED);
        memberRepository.save(member);
    }

    @Transactional
    public void acceptInvite(UUID communityId, User user) {
        Community community = getCommunityById(communityId);
        CommunityMember member = memberRepository.findByCommunityAndUser(community, user)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found"));
        if (member.getStatus() != CommunityMemberStatus.INVITED) {
            throw new IllegalArgumentException("No invitation found");
        }
        member.setStatus(CommunityMemberStatus.ACCEPTED);
        memberRepository.save(member);
    }

    @Transactional
    public void rejectInvite(UUID communityId, User user) {
        Community community = getCommunityById(communityId);
        CommunityMember member = memberRepository.findByCommunityAndUser(community, user)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found"));
        memberRepository.delete(member);
    }

    @Transactional
    public void removeMember(UUID communityId, UUID userId, User requester) {
        Community community = getCommunityById(communityId);
        ensureAdmin(community, requester);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        CommunityMember member = memberRepository.findByCommunityAndUser(community, user)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        if (member.getRole() == CommunityRole.OWNER) {
            throw new IllegalArgumentException("Cannot remove the community owner");
        }

        memberRepository.delete(member);
    }

    @Transactional
    public void assignRole(UUID communityId, UUID userId, CommunityRole role, User requester) {
        Community community = getCommunityById(communityId);
        ensureAdmin(community, requester);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        CommunityMember member = memberRepository.findByCommunityAndUser(community, user)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        if (member.getRole() == CommunityRole.OWNER) {
            throw new IllegalArgumentException("Cannot change owner role");
        }

        member.setRole(role);
        memberRepository.save(member);
    }

    @Transactional
    public void updateRules(UUID communityId, String rules, User requester) {
        Community community = getCommunityById(communityId);
        ensureAdmin(community, requester);
        community.setRules(rules);
        communityRepository.save(community);
    }

    private void ensureAdmin(Community community, User requester) {
        CommunityMember membership = memberRepository.findByCommunityAndUser(community, requester)
                .orElseThrow(() -> new IllegalArgumentException("Not a community member"));

        if (membership.getRole() != CommunityRole.OWNER && membership.getRole() != CommunityRole.ADMIN) {
            throw new IllegalArgumentException("Only community admins can manage members");
        }
    }
}
