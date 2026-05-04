package com.Blog.Platform.Community.Repository;

import com.Blog.Platform.Blog.Model.Category;
import com.Blog.Platform.Community.Model.Community;
import com.Blog.Platform.Community.Model.CommunityMemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Community, UUID> {

    Optional<Community> findByName(String name);

    boolean existsByName(String name);

    Page<Community> findByCategory(Category category, Pageable pageable);

    Page<Community> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Community> findByCategory_Id(UUID categoryId, Pageable pageable);

    Page<Community> findByNameContainingIgnoreCaseAndCategory_Id(String name, UUID categoryId, Pageable pageable);

    @Query("SELECT m.community FROM CommunityMember m WHERE m.user.id = :userId AND m.status = :status")
    Page<Community> findJoinedCommunities(@Param("userId") UUID userId, @Param("status") CommunityMemberStatus status, Pageable pageable);

    @Query("SELECT c FROM Community c WHERE c.owner.id = :ownerId")
    Page<Community> findOwnedCommunities(@Param("ownerId") UUID ownerId, Pageable pageable);

    long countByOwner_Id(UUID ownerId);

    @Query("""
            SELECT c FROM Community c
            LEFT JOIN CommunityMember cm ON cm.community = c AND cm.status = com.Blog.Platform.Community.Model.CommunityMemberStatus.ACCEPTED
            WHERE (:categoryId IS NULL OR c.category.id = :categoryId)
            AND (:search IS NULL OR :search = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(COALESCE(c.description, '')) LIKE LOWER(CONCAT('%', :search, '%')))
            GROUP BY c
            ORDER BY COUNT(cm) DESC, c.createdAt DESC
            """)
    Page<Community> findFeaturedCommunities(@Param("search") String search, @Param("categoryId") UUID categoryId, Pageable pageable);

    @Query("""
            SELECT c FROM Community c
            WHERE (:categoryId IS NULL OR c.category.id = :categoryId)
            AND (:search IS NULL OR :search = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(COALESCE(c.description, '')) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY c.createdAt DESC
            """)
    Page<Community> findNewestCommunities(@Param("search") String search, @Param("categoryId") UUID categoryId, Pageable pageable);

    java.util.List<Community> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name,
            String description);
}
