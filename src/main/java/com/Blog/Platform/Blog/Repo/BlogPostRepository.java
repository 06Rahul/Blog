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
    
    long countByAuthorAndStatus(User author, BlogStatus status);

    // Paginated
    Page<BlogPost> findByAuthorAndStatus(User author, BlogStatus status, Pageable pageable);

    Page<BlogPost> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    Page<BlogPost> findByStatus(BlogStatus status, Pageable pageable);
    
    Page<BlogPost> findByCategory_IdAndStatus(UUID categoryId, BlogStatus status, Pageable pageable);

    Optional<BlogPost> findByIdAndAuthor(UUID id, User author);

    Page<BlogPost> findByTitleContainingIgnoreCaseAndStatus(
            String title, BlogStatus status, Pageable pageable );

    @Query("""
    SELECT b FROM BlogPost b JOIN b.tags t WHERE LOWER(t.name) = LOWER(:tag) AND b.status = 'PUBLISHED' """)
    Page<BlogPost> findByTag(String tag, Pageable pageable);

    @Query("""
SELECT b FROM BlogPost b
WHERE LOWER(b.author.username) = LOWER(:username)
AND b.status = 'PUBLISHED'
""")
    Page<BlogPost> findByAuthorUsername(String username, Pageable pageable);

    List<BlogPost> findByModerationStatus(com.Blog.Platform.AiService.Model.ModerationStatus moderationStatus);

    @Query("SELECT bp FROM BlogPost bp WHERE bp.status = :status AND bp.moderationStatus = :modStatus AND bp.publishedAt >= :weekAgo AND bp.author.id IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId) ORDER BY bp.publishedAt DESC")
    List<BlogPost> findTopPostsFromFollowedAuthors(@org.springframework.data.repository.query.Param("userId") UUID userId, @org.springframework.data.repository.query.Param("status") BlogStatus status, @org.springframework.data.repository.query.Param("modStatus") com.Blog.Platform.AiService.Model.ModerationStatus modStatus, @org.springframework.data.repository.query.Param("weekAgo") java.time.LocalDateTime weekAgo);

    @Query("SELECT bp FROM BlogPost bp WHERE bp.status = :status AND bp.moderationStatus = :modStatus AND bp.publishedAt >= :weekAgo ORDER BY bp.publishedAt DESC")
    List<BlogPost> findGlobalTopPosts(@org.springframework.data.repository.query.Param("status") BlogStatus status, @org.springframework.data.repository.query.Param("modStatus") com.Blog.Platform.AiService.Model.ModerationStatus modStatus, @org.springframework.data.repository.query.Param("weekAgo") java.time.LocalDateTime weekAgo);

    List<BlogPost> findByPublishAtBeforeAndStatus(java.time.LocalDateTime publishAt, BlogStatus status);

    @Query(value = """
        SELECT b.* FROM blog_posts b
        LEFT JOIN (
            SELECT bt.blog_id, SUM(uta.affinity_score) as post_affinity
            FROM blog_tags bt
            JOIN tags t ON bt.tag_id = t.id
            JOIN user_tag_affinity uta ON t.name = uta.tag AND uta.user_id = :userId
            GROUP BY bt.blog_id
        ) aff ON aff.blog_id = b.id
        WHERE b.status = 'PUBLISHED'
        ORDER BY (
            (1.0 / (1.0 + DATEDIFF(NOW(), b.published_at))) * 0.35 +
            COALESCE(aff.post_affinity, 0) * 0.20
        ) DESC
    """, countQuery = "SELECT COUNT(*) FROM blog_posts WHERE status = 'PUBLISHED'", nativeQuery = true)
    Page<BlogPost> findRelevanceFeed(@org.springframework.data.repository.query.Param("userId") String userId, Pageable pageable);

    @Query("""
        SELECT DISTINCT b FROM BlogPost b 
        LEFT JOIN b.tags t 
        LEFT JOIN b.category c 
        WHERE (
            LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR 
            LOWER(b.content) LIKE LOWER(CONCAT('%', :query, '%')) OR
            LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')) OR
            LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR
            LOWER(b.author.username) LIKE LOWER(CONCAT('%', :query, '%')) OR
            LOWER(b.author.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR
            LOWER(b.author.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
        ) AND (:status IS NULL OR b.status = :status)
    """)
    Page<BlogPost> searchEverywhere(@org.springframework.data.repository.query.Param("query") String query, @org.springframework.data.repository.query.Param("status") BlogStatus status, Pageable pageable);

    @Query("SELECT bp FROM BlogPost bp WHERE bp.status = 'PUBLISHED' AND bp.author.id IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId) ORDER BY bp.publishedAt DESC")
    Page<BlogPost> findFollowingFeed(@org.springframework.data.repository.query.Param("userId") UUID userId, Pageable pageable);

    @Query(value = """
        SELECT b.* FROM blog_posts b
        WHERE b.status = 'PUBLISHED'
        ORDER BY (
            (1.0 / (1.0 + DATEDIFF(NOW(), b.published_at))) * 0.5 +
            COALESCE(b.reading_time, 1) * 0.1
        ) DESC
    """, countQuery = "SELECT COUNT(*) FROM blog_posts WHERE status = 'PUBLISHED'", nativeQuery = true)
    Page<BlogPost> findTrendingFeed(Pageable pageable);
}
