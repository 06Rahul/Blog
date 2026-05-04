package com.Blog.Platform.Community.Repository;

import com.Blog.Platform.Community.Model.Mention;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MentionRepository extends JpaRepository<Mention, UUID> {
    Page<Mention> findByMentionedUserOrderByCreatedAtDesc(User mentionedUser, Pageable pageable);
}
