package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.DTO.MessageResponse;
import com.Blog.Platform.User.DTO.MessageStatusUpdate;
import com.Blog.Platform.User.DTO.SendMessageRequest;
import com.Blog.Platform.User.Model.Conversation;
import com.Blog.Platform.User.Model.Message;
import com.Blog.Platform.User.Model.MessageStatus;
import com.Blog.Platform.User.Model.MessageType;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.ConversationRepository;
import com.Blog.Platform.User.Repo.MessageRepository;
import com.Blog.Platform.User.Repo.UserRepo;
import com.Blog.Platform.User.Service.MessageService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import java.util.UUID;

@Service
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepo userRepository;
    private final com.Blog.Platform.Chat.Repository.MessageReactionRepository messageReactionRepository;
    private final com.Blog.Platform.User.Service.BlockService blockService;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageServiceImpl(MessageRepository messageRepository,
                            ConversationRepository conversationRepository,
                            UserRepo userRepository,
                            com.Blog.Platform.Chat.Repository.MessageReactionRepository messageReactionRepository,
                            com.Blog.Platform.User.Service.BlockService blockService,
                            SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.messageReactionRepository = messageReactionRepository;
        this.blockService = blockService;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public MessageResponse sendMessage(UUID conversationId, SendMessageRequest request) {
        UUID senderId = SecurityUtil.getCurrentUserId();
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Verify user is part of this conversation
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!conversation.hasUser(sender)) {
            throw new RuntimeException("Unauthorized access to conversation");
        }

        User otherUser = conversation.getOtherUser(sender);
        if (otherUser != null && blockService.isBlocked(senderId, otherUser.getId())) {
            throw new RuntimeException("Cannot send message. You have blocked or been blocked by the target user.");
        }

        // Create and save message
        Message message = new Message(conversation, sender, request.getContent());
        message.setMessageType(MessageType.valueOf(request.getMessageType().toUpperCase()));
        message.setMediaUrl(request.getMediaUrl());

        message = messageRepository.save(message);

        // Update conversation's last message time
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        emitUnreadCount(otherUser);

        return convertToResponse(message);
    }

    @Override
    public Page<MessageResponse> getMessages(UUID conversationId, Pageable pageable) {
        UUID userId = SecurityUtil.getCurrentUserId();
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!conversation.hasUser(user)) {
            throw new RuntimeException("Unauthorized access to conversation");
        }

        User otherUser = conversation.getOtherUser(user);
        if (otherUser != null && blockService.isBlocked(userId, otherUser.getId())) {
             return new PageImpl<>(java.util.List.of(), pageable, 0);
        }

        messageRepository.findSentMessagesForRecipient(conversationId, userId).forEach(message -> {
            message.setStatus(MessageStatus.DELIVERED);
            if (message.getDeliveredAt() == null) {
                message.setDeliveredAt(LocalDateTime.now());
            }
            emitStatusUpdate(message, userId);
        });

        Page<Message> messages = messageRepository.findByConversation(conversationId, pageable);
        
        // Convert to response
        List<MessageResponse> responses = messages.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, messages.getPageable(), messages.getTotalElements());
    }

    @Override
    public void markAsRead(UUID messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        message.setRead(true);
        message.setStatus(MessageStatus.READ);
        if (message.getDeliveredAt() == null) {
            message.setDeliveredAt(LocalDateTime.now());
        }
        message.setReadAt(LocalDateTime.now());
        messageRepository.save(message);
        emitStatusUpdate(message, SecurityUtil.getCurrentUserId());
    }

    @Override
    public void markAsDelivered(UUID messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (message.getStatus() == MessageStatus.SENT) {
            message.setStatus(MessageStatus.DELIVERED);
            message.setDeliveredAt(LocalDateTime.now());
            messageRepository.save(message);
            emitStatusUpdate(message, SecurityUtil.getCurrentUserId());
        }
    }

    @Override
    public void markConversationAsRead(UUID conversationId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        messageRepository.findUnreadStatusMessagesForRecipient(conversationId, userId).forEach(message -> {
            if (message.getDeliveredAt() == null) {
                message.setDeliveredAt(LocalDateTime.now());
            }
            message.setRead(true);
            message.setStatus(MessageStatus.READ);
            message.setReadAt(LocalDateTime.now());
            emitStatusUpdate(message, userId);
        });
        messageRepository.markAsReadForUser(conversationId, userId);
        User currentUser = userRepository.findById(userId).orElse(null);
        emitUnreadCount(currentUser);
    }

    @Override
    public long getUnreadCount(UUID conversationId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        return messageRepository.countUnreadMessages(conversationId, userId);
    }

    @Override
    public long getTotalUnreadMessages() {
        UUID userId = SecurityUtil.getCurrentUserId();
        return messageRepository.countTotalUnreadMessagesForUser(userId);
    }

    @Override
    public void deleteMessage(UUID messageId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Only sender can delete their message
        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this message");
        }

        messageRepository.delete(message);
    }

    @Override
    public Message getMessageById(UUID messageId) {
        return messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    @Override
    public com.Blog.Platform.Chat.DTO.ReactionResponse addReaction(UUID messageId, String emoji) {
        UUID userId = SecurityUtil.getCurrentUserId();
        Message msg = getMessageById(messageId);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        com.Blog.Platform.Chat.Model.MessageReaction reaction = new com.Blog.Platform.Chat.Model.MessageReaction();
        reaction.setMessage(msg);
        reaction.setUser(user);
        reaction.setEmoji(emoji);
        reaction = messageReactionRepository.save(reaction);
        return new com.Blog.Platform.Chat.DTO.ReactionResponse(reaction.getId(), messageId, userId, emoji, reaction.getCreatedAt());
    }

    @Override
    public void removeReaction(UUID messageId, String emoji) {
        UUID userId = SecurityUtil.getCurrentUserId();
        messageReactionRepository.deleteByMessage_IdAndUser_IdAndEmoji(messageId, userId, emoji);
    }

    private MessageResponse convertToResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getSender().getActualUsername(),
                message.getSender().getProfileImageUrl(),
                message.getContent(),
                message.getCreatedAt(),
                message.isRead(),
                message.getStatus().name(),
                message.getDeliveredAt(),
                message.getReadAt(),
                message.getMediaUrl(),
                message.getMessageType().name()
        );
    }

    private void emitStatusUpdate(Message message, UUID actorUserId) {
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + message.getConversation().getId() + "/status",
                new MessageStatusUpdate(
                        message.getId(),
                        message.getConversation().getId(),
                        actorUserId,
                        message.getStatus().name(),
                        message.getDeliveredAt(),
                        message.getReadAt()
                )
        );
    }

    private void emitUnreadCount(User user) {
        if (user == null) {
            return;
        }
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/messages/unread-count",
                java.util.Map.of("totalUnread", messageRepository.countTotalUnreadMessagesForUser(user.getId()))
        );
    }
}
