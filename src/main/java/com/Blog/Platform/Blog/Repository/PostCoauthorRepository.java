package com.Blog.Platform.Blog.Repository;

import com.Blog.Platform.Blog.Model.CoauthorStatus;
import com.Blog.Platform.Blog.Model.PostCoauthor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PostCoauthorRepository extends JpaRepository<PostCoauthor, UUID> {

    boolean existsByBlogIdAndSubjectUserId(UUID blogId, UUID userId);
    
    boolean existsByBlogIdAndSubjectUserIdAndStatus(UUID blogId, UUID userId, CoauthorStatus status);

    List<PostCoauthor> findByBlogIdAndStatus(UUID blogId, CoauthorStatus status);

    void deleteByBlogIdAndSubjectUserId(UUID blogId, UUID userId);
}
