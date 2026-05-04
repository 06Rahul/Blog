package com.Blog.Platform.Blog.Repo;

import com.Blog.Platform.Blog.Model.BlogMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface BlogMetadataRepository extends JpaRepository<BlogMetadata, Long> {
    void deleteByBlogId(UUID blogId);
    List<BlogMetadata> findByBlogId(UUID blogId);

    @org.springframework.data.jpa.repository.Query("SELECT bm.blogId FROM BlogMetadata bm WHERE bm.keyword IN :keywords AND bm.blogId != :blogId GROUP BY bm.blogId ORDER BY COUNT(bm) DESC")
    List<UUID> findTopRelatedBlogs(@org.springframework.data.repository.query.Param("keywords") List<String> keywords, @org.springframework.data.repository.query.Param("blogId") UUID blogId, org.springframework.data.domain.Pageable pageable);
}
