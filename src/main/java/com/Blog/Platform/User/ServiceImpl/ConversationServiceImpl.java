package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.DTO.ConversationResponse;
import com.Blog.Platform.User.Model.Conversation;
import com.Blog.Platform.User.Model.Message;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.ConversationRepository;
import com.Blog.Platform.User.Repo.FollowRepository;
import com.Blog.Platform.User.Repo.MessageRepository;
import com.Blog.Platform.User.Repo.UserRepo;
import com.Blog.Platform.User.Service.ChatPresenceService;
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
    private final FollowRepository followRepository;
    private final ChatPresenceService chatPresenceService;

    public ConversationServiceImpl(ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepo userRepository,
            FollowService followService,
            FollowRepository followRepository,
            ChatPresenceService chatPresenceService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.followService = followService;
        this.followRepository = followRepository;
        this.chatPresenceService = chatPresenceService;
    }

    @Override
    public Conversation getOrCreateConversation(UUID user1Id, UUID user2Id) {
        if (!canChat(user1Id, user2Id)) {
            throw new IllegalArgumentException("Invalid users for chat");
        }

        return conversationRepository.findBetweenUsers(user1Id, user2Id)
                .orElseGet(() -> {
                    User user1 = userRepository.findById(user1Id)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    User user2 = userRepository.findById(user2Id)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    
                    Conversation conversation = new Conversation(user1, user2);
                    conversation.setInitiator(user1);
                    
                    // Accept if one follows the other
                    boolean following = followRepository.existsByFollowerAndFollowing(user1, user2) ||
                                       followRepository.existsByFollowerAndFollowing(user2, user1);
                    
                    conversation.setStatus(following ? 
                        com.Blog.Platform.User.Model.ConversationStatus.ACCEPTED : 
                        com.Blog.Platform.User.Model.ConversationStatus.REQUESTED);
                        
                    return conversationRepository.save(conversation);
                });
    }

    @Override
    public Optional<Conversation> getConversation(UUID conversationId) {
        return conversationRepository.findById(conversationId);
    }

    @Override
    public ConversationResponse getConversationById(UUID conversationId) {
        UUID userId = userRepository.findByEmail(SecurityUtil.getCurrentUserEmail()).orElseThrow(() -> new RuntimeException("User not found")).getId();
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
                otherUser.getBio(),
                otherUser.getContactInfo(),
                (otherUser.getFirstName() + " " + java.util.Optional.ofNullable(otherUser.getLastName()).orElse("")).trim(),
                chatPresenceService.isOnline(otherUser.getId()),
                chatPresenceService.getLastSeen(otherUser.getId()),
                lastMessage,
                conversation.getLastMessageAt(),
                unreadCount,
                conversation.getCreatedAt(),
                conversation.getInitiator() != null ? conversation.getInitiator().getId() : null,
                conversation.getStatus());
    }

    @Override
    public Page<ConversationResponse> getUserConversations(Pageable pageable) {
        UUID userId = userRepository.findByEmail(SecurityUtil.getCurrentUserEmail()).orElseThrow(() -> new RuntimeException("User not found")).getId();
        Page<Conversation> conversations = conversationRepository.findAllByUser(userId, pageable);
        return convertToResponse(conversations, userId);
    }

    @Override
    public Page<ConversationResponse> getActiveConversations(Pageable pageable) {
        UUID userId = userRepository.findByEmail(SecurityUtil.getCurrentUserEmail()).orElseThrow(() -> new RuntimeException("User not found")).getId();
        Page<Conversation> conversations = conversationRepository.findActiveByUser(userId, pageable);
        return convertToResponse(conversations, userId);
    }

    @Override
    public boolean canChat(UUID user1Id, UUID user2Id) {
        if (user1Id.equals(user2Id)) {
            return false;
        }
        return userRepository.existsById(user1Id) && userRepository.existsById(user2Id);
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
        UUID userId = userRepository.findByEmail(SecurityUtil.getCurrentUserEmail()).orElseThrow(() -> new RuntimeException("User not found")).getId();
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

    @Override
    public void acceptConversation(UUID conversationId) {
        UUID userId = userRepository.findByEmail(SecurityUtil.getCurrentUserEmail()).orElseThrow(() -> new RuntimeException("User not found")).getId();
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conv.hasUser(userRepository.findById(userId).orElse(null))) {
            throw new RuntimeException("Unauthorized");
        }
        if (conv.getInitiator() != null && conv.getInitiator().getId().equals(userId)) {
            throw new RuntimeException("Initiator cannot accept their own request");
        }
        conv.setStatus(com.Blog.Platform.User.Model.ConversationStatus.ACCEPTED);
        conversationRepository.save(conv);
    }

    @Override
    public void rejectConversation(UUID conversationId) {
        UUID userId = userRepository.findByEmail(SecurityUtil.getCurrentUserEmail()).orElseThrow(() -> new RuntimeException("User not found")).getId();
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conv.hasUser(userRepository.findById(userId).orElse(null))) {
            throw new RuntimeException("Unauthorized");
        }
        if (conv.getInitiator() != null && conv.getInitiator().getId().equals(userId)) {
            throw new RuntimeException("Initiator cannot reject their own request");
        }
        conv.setStatus(com.Blog.Platform.User.Model.ConversationStatus.REJECTED);
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
                            otherUser.getBio(),
                            otherUser.getContactInfo(),
                            (otherUser.getFirstName() + " " + java.util.Optional.ofNullable(otherUser.getLastName()).orElse("")).trim(),
                            chatPresenceService.isOnline(otherUser.getId()),
                            chatPresenceService.getLastSeen(otherUser.getId()),
                            lastMessage,
                            conv.getLastMessageAt(),
                            unreadCount,
                            conv.getCreatedAt(),
                            conv.getInitiator() != null ? conv.getInitiator().getId() : null,
                            conv.getStatus());
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, conversations.getPageable(), conversations.getTotalElements());
    }
}
