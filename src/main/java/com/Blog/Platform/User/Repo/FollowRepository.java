package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.Follow;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FollowRepository extends JpaRepository<Follow, UUID> {

    boolean existsByFollowerAndFollowing(User follower, User following);

    long countByFollower(User follower);
    long countByFollowing(User following);

    Page<Follow> findByFollower(User follower, Pageable pageable);
    Page<Follow> findByFollowing(User following, Pageable pageable);

    List<Follow> findByFollower(User follower);
    List<Follow> findByFollowing(User following); // ✅ ADD THIS

    void deleteByFollowerAndFollowing(User follower, User following);
}

