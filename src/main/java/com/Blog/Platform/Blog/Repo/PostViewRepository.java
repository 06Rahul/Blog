package com.Blog.Platform.Blog.Repo;

import com.Blog.Platform.Blog.Model.PostView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface PostViewRepository extends JpaRepository<PostView, String> {
    boolean existsByBlogIdAndSessionIdAndViewedAtAfter(UUID blogId, String sessionId, LocalDateTime viewedAt);
}
