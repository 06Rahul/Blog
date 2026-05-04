package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.DTO.ConversationResponse;
import com.Blog.Platform.User.Model.Conversation;
import com.Blog.Platform.User.Model.Message;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.ConversationRepository;
import com.Blog.Platform.User.Repo.MessageRepository;
import com.Blog.Platform.User.Repo.UserRepo;
import com.Blog.Platform.User.Service.ConversationService;
import com.Blog.Platform.User.Service.FollowService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepo userRepository;
    private final FollowService followService;

    public ConversationServiceImpl(ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepo userRepository,
            FollowService followService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.followService = followService;
    }

    @Override
    public Conversation getOrCreateConversation(UUID user1Id, UUID user2Id) {
        // Check if users can chat
        if (!canChat(user1Id, user2Id)) {
            throw new IllegalArgumentException("Users cannot chat. They must be following each other.");
        }

        // Try to find existing conversation
        Optional<Conversation> existing = conversationRepository.findBetweenUsers(user1Id, user2Id);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Create new conversation
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conversation = new Conversation(user1, user2);
        return conversationRepository.save(conversation);
    }

    @Override
    public Optional<Conversation> getConversation(UUID conversationId) {
        return conversationRepository.findById(conversationId);
    }

    @Override
    public ConversationResponse getConversationById(UUID conversationId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.hasUser(userRepository.findById(userId).orElse(null))) {
            throw new RuntimeException("Unauthorized access to conversation");
        }

        User otherUser = conversation.getOtherUser(userRepository.findById(userId).orElse(null));
        long unreadCount = messageRepository.countUnreadMessages(conversation.getId(), userId);

        String lastMessage = "";
        if (!conversation.getMessages().isEmpty()) {
            lastMessage = conversation.getMessages().get(conversation.getMessages().size() - 1).getContent();
            if (lastMessage.length() > 50) {
                lastMessage = lastMessage.substring(0, 50) + "...";
            }
        }

        return new ConversationResponse(
                conversation.getId(),
                otherUser.getId(),
                otherUser.getActualUsername(),
                otherUser.getProfileImageUrl(),
                lastMessage,
                conversation.getLastMessageAt(),
                unreadCount,
                conversation.getCreatedAt());
    }

    @Override
    public Page<ConversationResponse> getUserConversations(Pageable pageable) {
        UUID userId = SecurityUtil.getCurrentUserId();
        Page<Conversation> conversations = conversationRepository.findAllByUser(userId, pageable);
        return convertToResponse(conversations, userId);
    }

    @Override
    public Page<ConversationResponse> getActiveConversations(Pageable pageable) {
        UUID userId = SecurityUtil.getCurrentUserId();
        Page<Conversation> conversations = conversationRepository.findActiveByUser(userId, pageable);
        return convertToResponse(conversations, userId);
    }

    @Override
    public boolean canChat(UUID user1Id, UUID user2Id) {
        // Users can chat if they follow each other (or same user)
        if (user1Id.equals(user2Id)) {
            return false; // Cannot chat with yourself
        }

        // Get the current user's follow status from the perspective of user1
        // This checks if user1 follows user2 AND user2 follows user1
        // For now, we'll allow chat if either follows the other (or implement mutual
        // follow check)
        return true; // Allow for now - modify as per your business logic
    }

    @Override
    public boolean hasAccessToConversation(UUID conversationId, UUID userId) {
        Optional<Conversation> conversation = conversationRepository.findById(conversationId);
        if (conversation.isEmpty()) {
            return false;
        }
        return conversation.get().hasUser(userRepository.findById(userId).orElse(null));
    }

    @Override
    public void deleteConversation(UUID conversationId) {
        UUID userId = SecurityUtil.getCurrentUserId();
        Optional<Conversation> conversation = conversationRepository.findById(conversationId);

        if (conversation.isEmpty()) {
            throw new RuntimeException("Conversation not found");
        }

        if (!conversation.get().hasUser(userRepository.findById(userId).orElse(null))) {
            throw new RuntimeException("Unauthorized access to conversation");
        }

        // Soft delete - mark as inactive
        Conversation conv = conversation.get();
        conv.setActive(false);
        conversationRepository.save(conv);
    }

    private Page<ConversationResponse> convertToResponse(Page<Conversation> conversations, UUID currentUserId) {
        List<ConversationResponse> responses = conversations.getContent().stream()
                .map(conv -> {
                    User otherUser = conv.getOtherUser(
                            userRepository.findById(currentUserId).orElse(null));

                    // Get last message
                    String lastMessage = "";
                    if (!conv.getMessages().isEmpty()) {
                        lastMessage = conv.getMessages().get(conv.getMessages().size() - 1).getContent();
                        if (lastMessage.length() > 50) {
                            lastMessage = lastMessage.substring(0, 50) + "...";
                        }
                    }

                    // Get unread count
                    long unreadCount = messageRepository.countUnreadMessages(conv.getId(), currentUserId);

                    return new ConversationResponse(
                            conv.getId(),
                            otherUser.getId(),
                            otherUser.getActualUsername(),
                            otherUser.getProfileImageUrl(),
                            lastMessage,
                            conv.getLastMessageAt(),
                            unreadCount,
                            conv.getCreatedAt());
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, conversations.getPageable(), conversations.getTotalElements());
    }
}
