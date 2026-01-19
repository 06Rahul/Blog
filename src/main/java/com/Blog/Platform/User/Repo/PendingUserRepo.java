package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PendingUserRepo extends JpaRepository<PendingUser, UUID> {

    Optional<PendingUser> findByEmail(String email);

    List<PendingUser> findByExpiresAtBefore(LocalDateTime dateTime);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
