package com.Blog.Platform.Community.Repository;

import com.Blog.Platform.Community.Model.Community;
import com.Blog.Platform.Community.Model.CommunityMember;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, UUID> {

    Optional<CommunityMember> findByCommunityAndUser(Community community, User user);

    boolean existsByCommunityAndUser(Community community, User user);

    boolean existsByCommunityIdAndUserId(UUID communityId, UUID userId);

    Page<CommunityMember> findByCommunity(Community community, Pageable pageable);

    List<CommunityMember> findByCommunity(Community community);

    Page<CommunityMember> findByUser(User user, Pageable pageable);

    Page<CommunityMember> findByUserAndStatusOrderByJoinedAtDesc(User user, com.Blog.Platform.Community.Model.CommunityMemberStatus status, Pageable pageable);

    long countByUser(User user);
    
    long countByUserAndStatus(User user, com.Blog.Platform.Community.Model.CommunityMemberStatus status);
    
    long countByUserAndRole(User user, com.Blog.Platform.Community.Model.CommunityRole role);

    long countByCommunity(Community community);
}
