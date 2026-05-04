package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserBlockRepository extends JpaRepository<UserBlock, UUID> {

    Optional<UserBlock> findByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);

    boolean existsByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);

    @Query("SELECT CASE WHEN COUNT(ub) > 0 THEN true ELSE false END FROM UserBlock ub WHERE (ub.blocker.id = :userA AND ub.blocked.id = :userB) OR (ub.blocker.id = :userB AND ub.blocked.id = :userA)")
    boolean existsBlockBetween(@org.springframework.data.repository.query.Param("userA") UUID userA, @org.springframework.data.repository.query.Param("userB") UUID userB);

    List<UserBlock> findByBlockerId(UUID blockerId);
}
