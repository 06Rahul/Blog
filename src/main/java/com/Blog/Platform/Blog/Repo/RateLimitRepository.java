package com.Blog.Platform.Blog.Repo;

import com.Blog.Platform.Blog.Model.RateLimitRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface RateLimitRepository extends JpaRepository<RateLimitRecord, UUID> {
    Optional<RateLimitRecord> findByClientIpAndApiPathAndWindowStartAfter(String clientIp, String apiPath, LocalDateTime windowStart);
    Optional<RateLimitRecord> findByUserIdAndApiPathAndWindowStartAfter(UUID userId, String apiPath, LocalDateTime windowStart);
}
