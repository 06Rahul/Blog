package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.Conversation;
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
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    // Find conversation between two users
    @Query("SELECT c FROM Conversation c WHERE (c.user1.id = :user1Id AND c.user2.id = :user2Id) " +
           "OR (c.user1.id = :user2Id AND c.user2.id = :user1Id)")
    Optional<Conversation> findBetweenUsers(@Param("user1Id") UUID user1Id, @Param("user2Id") UUID user2Id);

    // Get all conversations for a user
    @Query("SELECT c FROM Conversation c WHERE (c.user1.id = :userId OR c.user2.id = :userId) " +
           "ORDER BY c.lastMessageAt DESC")
    Page<Conversation> findAllByUser(@Param("userId") UUID userId, Pageable pageable);

    // Get active conversations for a user
    @Query("SELECT c FROM Conversation c WHERE (c.user1.id = :userId OR c.user2.id = :userId) " +
           "AND c.isActive = true ORDER BY c.lastMessageAt DESC")
    Page<Conversation> findActiveByUser(@Param("userId") UUID userId, Pageable pageable);

    // Check if conversation exists between two users
    @Query("SELECT COUNT(c) > 0 FROM Conversation c WHERE (c.user1.id = :user1Id AND c.user2.id = :user2Id) " +
           "OR (c.user1.id = :user2Id AND c.user2.id = :user1Id)")
    boolean existsBetweenUsers(@Param("user1Id") UUID user1Id, @Param("user2Id") UUID user2Id);
}
