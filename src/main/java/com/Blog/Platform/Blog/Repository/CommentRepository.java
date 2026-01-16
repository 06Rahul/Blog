package com.Blog.Platform.Blog.Repository;

import com.Blog.Platform.Blog.Model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    Page<Comment> findByBlog_IdOrderByCreatedAtDesc(UUID blogId, Pageable pageable);

    long countByBlog_Id(UUID blogId);
}
