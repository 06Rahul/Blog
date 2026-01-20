package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

       // Get all messages for a conversation
       @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt ASC")
       Page<Message> findByConversation(@Param("conversationId") UUID conversationId, Pageable pageable);

       // Get unread messages for a user in a conversation
       @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
                     "AND m.sender.id != :userId AND m.isRead = false")
       long countUnreadMessages(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);

       // Mark all messages in conversation as read for a user
       @Modifying
       @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId " +
                     "AND m.sender.id != :userId")
       void markAsReadForUser(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);

       // Get total unread messages for a user
       @Query("SELECT COUNT(m) FROM Message m WHERE (m.conversation.user1.id = :userId OR m.conversation.user2.id = :userId) "
                     +
                     "AND m.sender.id != :userId AND m.isRead = false")
       long countTotalUnreadMessagesForUser(@Param("userId") UUID userId);
}
