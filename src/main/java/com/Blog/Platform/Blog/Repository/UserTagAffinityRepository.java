package com.Blog.Platform.Blog.Repository;

import com.Blog.Platform.Blog.Model.UserTagAffinity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserTagAffinityRepository extends JpaRepository<UserTagAffinity, UUID> {
    Optional<UserTagAffinity> findByUserIdAndTag(UUID userId, String tag);
}
