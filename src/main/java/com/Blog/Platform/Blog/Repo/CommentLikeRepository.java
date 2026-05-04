package com.Blog.Platform.Blog.Repo;

import com.Blog.Platform.Blog.Model.Comment;
import com.Blog.Platform.Blog.Model.CommentLike;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CommentLikeRepository extends JpaRepository<CommentLike, UUID> {
    Optional<CommentLike> findByUserAndComment(User user, Comment comment);
    long countByComment(Comment comment);
    boolean existsByUserAndComment(User user, Comment comment);
}
