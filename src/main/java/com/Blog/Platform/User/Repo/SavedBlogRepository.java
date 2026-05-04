package com.Blog.Platform.User.Repo;

import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.User.Model.SavedBlog;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedBlogRepository extends JpaRepository<SavedBlog, UUID> {

    @Query("SELECT s FROM SavedBlog s WHERE s.user = :user ORDER BY s.savedAt DESC")
    Page<SavedBlog> findMySavedBlogs(@Param("user") User user, Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM SavedBlog s WHERE s.user = :user AND s.blog = :blog")
    boolean isBlogSaved(@Param("user") User user, @Param("blog") BlogPost blog);

    @Query("SELECT s FROM SavedBlog s WHERE s.user = :user AND s.blog = :blog")
    Optional<SavedBlog> findSavedBlog(@Param("user") User user, @Param("blog") BlogPost blog);
}
