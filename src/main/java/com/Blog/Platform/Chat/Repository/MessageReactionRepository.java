package com.Blog.Platform.Chat.Repository;

import com.Blog.Platform.Chat.Model.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, UUID> {
    void deleteByMessage_IdAndUser_IdAndEmoji(UUID messageId, UUID userId, String emoji);
}
