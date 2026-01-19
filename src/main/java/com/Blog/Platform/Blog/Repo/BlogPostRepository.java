package com.Blog.Platform.Blog.Repo;

import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.BlogStatus;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlogPostRepository extends JpaRepository<BlogPost, UUID> {

        // Non-paginated (optional but useful)
        List<BlogPost> findByAuthorAndStatus(User author, BlogStatus status);

        // Paginated
        Page<BlogPost> findByAuthorAndStatus(User author, BlogStatus status, Pageable pageable);

        Page<BlogPost> findByStatus(BlogStatus status, Pageable pageable);

        Optional<BlogPost> findByIdAndAuthor(UUID id, User author);

        Page<BlogPost> findByTitleContainingIgnoreCaseAndStatus(
                        String title, BlogStatus status, Pageable pageable);

        @Query("""
                        SELECT b FROM BlogPost b JOIN b.tags t WHERE LOWER(t.name) = LOWER(:tag) AND b.status = com.Blog.Platform.Blog.Model.BlogStatus.PUBLISHED
                        """)
        Page<BlogPost> findByTag(String tag, Pageable pageable);

        @Query("""
                        SELECT b FROM BlogPost b
                        WHERE LOWER(b.author.username) = LOWER(:username)
                        AND b.status = com.Blog.Platform.Blog.Model.BlogStatus.PUBLISHED
                        """)
        Page<BlogPost> findByAuthorUsername(String username, Pageable pageable);

        @Query("""
                        SELECT b FROM BlogPost b WHERE b.category.id = :categoryId AND b.status = com.Blog.Platform.Blog.Model.BlogStatus.PUBLISHED
                        """)
        Page<BlogPost> findByCategoryId(UUID categoryId, Pageable pageable);

        // For Feed
        Page<BlogPost> findByAuthorIn(java.util.Collection<com.Blog.Platform.User.Model.User> authors,
                        Pageable pageable);

        @Query("SELECT DISTINCT b FROM BlogPost b LEFT JOIN b.tags t WHERE " +
                        "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(b.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(b.author.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
                        "AND b.status = com.Blog.Platform.Blog.Model.BlogStatus.PUBLISHED")
        Page<BlogPost> searchEverywhere(@org.springframework.data.repository.query.Param("query") String query,
                        Pageable pageable);
}
