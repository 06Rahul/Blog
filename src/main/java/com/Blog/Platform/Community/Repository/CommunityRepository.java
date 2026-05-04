package com.Blog.Platform.Community.Repository;

import com.Blog.Platform.Blog.Model.Category;
import com.Blog.Platform.Community.Model.Community;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Community, UUID> {

    Optional<Community> findByName(String name);

    boolean existsByName(String name);

    Page<Community> findByCategory(Category category, Pageable pageable);

    Page<Community> findByOwner(User owner, Pageable pageable);

    Page<Community> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Community> findByCategory_Id(UUID categoryId, Pageable pageable);

    Page<Community> findByNameContainingIgnoreCaseAndCategory_Id(String name, UUID categoryId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT m.community FROM CommunityMember m WHERE m.user = :user")
    Page<Community> findJoinedCommunities(User user, Pageable pageable);

    java.util.List<Community> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name,
            String description);
}
