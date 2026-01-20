package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.DTO.MessageResponse;
import com.Blog.Platform.User.DTO.SendMessageRequest;
import com.Blog.Platform.User.Model.Conversation;
import com.Blog.Platform.User.Model.Message;
import com.Blog.Platform.User.Model.MessageType;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.ConversationRepository;
import com.Blog.Platform.User.Repo.MessageRepository;
import com.Blog.Platform.User.Repo.UserRepo;
import com.Blog.Platform.User.Service.MessageService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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

    public MessageServiceImpl(MessageRepository messageRepository,
                            ConversationRepository conversationRepository,
                            UserRepo userRepository) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
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

        // Create and save message
        Message message = new Message(conversation, sender, request.getContent());
        message.setMessageType(MessageType.valueOf(request.getMessageType().toUpperCase()));
        message.setMediaUrl(request.getMediaUrl());

        message = messageRepository.save(message);

        // Update conversation's last message time
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

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
        messageRepository.save(message);
    }

    @Override
    public void markConversationAsRead(UUID conversationId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        messageRepository.markAsReadForUser(conversationId, userId);
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
                message.getMediaUrl(),
                message.getMessageType().name()
        );
    }
}
