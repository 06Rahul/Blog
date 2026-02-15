package com.Blog.Platform.Community.Service;

import com.Blog.Platform.Blog.Model.Category;
import com.Blog.Platform.Blog.Repo.CategoryRepository;
import com.Blog.Platform.Community.DTO.CommunityCreateRequest;
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
        memberRepository.save(member);

        return savedCommunity;
    }

    public Page<Community> getAllCommunities(String search, UUID categoryId, boolean onlyJoined, User currentUser,
            Pageable pageable) {
        if (onlyJoined && currentUser != null) {
            // "My Communities" + Optional Search
            // Note: If we want to support search WITHIN joined communities, we need a
            // separate query.
            // For now, let's assume 'onlyJoined' overrides general search if complex, OR we
            // add findJoinedCommunitiesByName...
            // Simple implementation: Just return joined.
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

        if (memberRepository.existsByCommunityAndUser(community, user)) {
            throw new IllegalArgumentException("User is already a member of this community");
        }

        if (community.getVisibility() == CommunityVisibility.PRIVATE) {
            // For now, allow joining private if not implemented invite system, OR block it.
            // Requirement says PRIVATE (invite-only). So prevent direct join.
            // But existing requirement list doesn't specify invite system details yet.
            // I will throw error for now.
            if (!community.getOwner().getId().equals(user.getId())) { // Owner is already member so this check handles
                                                                      // non-owners
                throw new IllegalArgumentException("This community is private. You must be invited to join.");
            }
        }

        CommunityMember member = new CommunityMember();
        member.setCommunity(community);
        member.setUser(user);
        member.setRole(CommunityRole.MEMBER);
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
}
