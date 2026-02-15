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

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, UUID> {

    Optional<CommunityMember> findByCommunityAndUser(Community community, User user);

    boolean existsByCommunityAndUser(Community community, User user);

    Page<CommunityMember> findByCommunity(Community community, Pageable pageable);

    Page<CommunityMember> findByUser(User user, Pageable pageable);
}
