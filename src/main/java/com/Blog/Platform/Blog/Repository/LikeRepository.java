package com.Blog.Platform.Blog.Repository;

import com.Blog.Platform.Blog.Model.Like;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {
    Optional<Like> findByUserAndBlog(User user, BlogPost blog);

    long countByBlog(BlogPost blog);

    boolean existsByUserAndBlog(User user, BlogPost blog);
}
