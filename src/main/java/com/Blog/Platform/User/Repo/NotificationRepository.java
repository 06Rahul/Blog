package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.Notification;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    long countByRecipientAndIsReadFalse(User recipient);
}
