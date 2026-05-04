package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;

@Repository
public interface UserRepo extends JpaRepository<User, UUID> {

    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsername(String username);
    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByMobileNumber(String mobileNumber);
    java.util.List<User> findByDigestEnabledTrue();
    java.util.List<User> findByUsernameContainingIgnoreCase(String query);

    @Query(value = """
            select u from User u
            where u.id <> :currentUserId
              and u.id not in (
                  select f.following.id from Follow f
                  where f.follower.id = :currentUserId
              )
            order by u.createdAt desc
            """,
           countQuery = """
            select count(u) from User u
            where u.id <> :currentUserId
              and u.id not in (
                  select f.following.id from Follow f
                  where f.follower.id = :currentUserId
              )
            """)
    Page<User> findSuggestedUsers(@Param("currentUserId") UUID currentUserId, Pageable pageable);
}
