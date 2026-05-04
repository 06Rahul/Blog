package com.Blog.Platform.Community.Service;

import com.Blog.Platform.Community.DTO.ReplyCreateRequest;
import com.Blog.Platform.Community.DTO.ThreadCreateRequest;
import com.Blog.Platform.Community.Model.*;
import com.Blog.Platform.Community.Repository.CommunityMemberRepository;
import com.Blog.Platform.Community.Repository.CommunityRepository;
import com.Blog.Platform.Community.Repository.DiscussionThreadRepository;
import com.Blog.Platform.Community.Repository.ThreadReplyRepository;
import com.Blog.Platform.User.Model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class DiscussionService {

    @Autowired
    private DiscussionThreadRepository threadRepository;

    @Autowired
    private ThreadReplyRepository replyRepository;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private CommunityMemberRepository memberRepository;

    @Autowired
    private com.Blog.Platform.Community.Repository.MentionRepository mentionRepository;

    @Autowired
    private com.Blog.Platform.User.Repo.UserRepo userRepo;

    @Autowired
    private com.Blog.Platform.User.Service.NotificationService notificationService;

    @Transactional
    public DiscussionThread createThread(ThreadCreateRequest request, User author) {
        Community community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        // Check if author is member
        if (!memberRepository.existsByCommunityAndUser(community, author)) {
            // For public communities, maybe allow posting? Requirement says "Members can
            // create".
            // So enforce membership.
            throw new IllegalArgumentException("You must be a member of the community to post.");
        }

        DiscussionThread thread = new DiscussionThread();
        thread.setTitle(request.getTitle());
        thread.setContent(request.getContent());
        thread.setCommunity(community);
        thread.setAuthor(author);
        thread.setStatus(ThreadStatus.OPEN);

        DiscussionThread savedThread = threadRepository.save(thread);
        processMentions(savedThread.getContent(), savedThread.getId(), MentionType.THREAD, author);
        return savedThread;
    }

    @Transactional
    public ThreadReply createReply(ReplyCreateRequest request, UUID threadId, User author) {
        DiscussionThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("Thread not found"));

        if (thread.getStatus() != ThreadStatus.OPEN) {
            throw new IllegalArgumentException("This thread is locked or archived.");
        }

        // Check community membership
        if (!memberRepository.existsByCommunityAndUser(thread.getCommunity(), author)) {
            throw new IllegalArgumentException("You must be a member of the community to reply.");
        }

        ThreadReply reply = new ThreadReply();
        reply.setContent(request.getContent());
        reply.setThread(thread);
        reply.setAuthor(author);

        if (request.getParentId() != null) {
            ThreadReply parent = replyRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent reply not found"));
            reply.setParent(parent);
        }

        ThreadReply savedReply = replyRepository.save(reply);
        processMentions(savedReply.getContent(), savedReply.getId(), MentionType.REPLY, author);
        return savedReply;
    }

    public DiscussionThread getThread(UUID threadId) {
        DiscussionThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("Thread not found"));

        // Increment view count (simple implementation, usually async or cached)
        thread.setViewCount(thread.getViewCount() + 1);
        threadRepository.save(thread);

        return thread;
    }

    public Page<DiscussionThread> getThreadsByCommunity(UUID communityId, Pageable pageable) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));
        return threadRepository.findByCommunity(community, pageable);
    }

    @Transactional
    public void deleteThread(UUID threadId, User user) {
        DiscussionThread thread = getThread(threadId);

        // Check permissions: Author or Community Admin/Mod
        boolean isAuthor = thread.getAuthor().getId().equals(user.getId());

        if (!isAuthor) {
            CommunityMember member = memberRepository.findByCommunityAndUser(thread.getCommunity(), user)
                    .orElseThrow(() -> new IllegalArgumentException("Not authorized"));

            if (member.getRole() == CommunityRole.MEMBER) {
                throw new IllegalArgumentException("Not authorized to delete this thread");
            }
        }

        threadRepository.delete(thread);
    }

    public Page<ThreadReply> getThreadReplies(UUID threadId, Pageable pageable) {
        DiscussionThread thread = getThread(threadId); // Validates existence
        return replyRepository.findByThreadAndParentIsNull(thread, pageable);
    }

    @Transactional
    public DiscussionThread updateThread(UUID threadId, ThreadCreateRequest request, User user) {
        DiscussionThread thread = getThread(threadId);

        // Owner Check
        boolean isAuthor = thread.getAuthor().getId().equals(user.getId());

        if (!isAuthor) {
            // Admin Check
            CommunityMember member = memberRepository.findByCommunityAndUser(thread.getCommunity(), user)
                    .orElseThrow(() -> new IllegalArgumentException("Not authorized"));

            if (member.getRole() == CommunityRole.MEMBER) {
                throw new IllegalArgumentException("Not authorized to edit this thread");
            }
        }

        thread.setTitle(request.getTitle());
        thread.setContent(request.getContent());

        DiscussionThread savedThread = threadRepository.save(thread);
        processMentions(savedThread.getContent(), savedThread.getId(), MentionType.THREAD, user);
        return savedThread;
    }

    private void processMentions(String content, UUID contentId, MentionType type, User actor) {
        if (content == null || content.isEmpty())
            return;

        // Simple regex for @username (assuming username contains alphanumeric, dots,
        // underscores)
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("@(\\w+)");
        java.util.regex.Matcher matcher = pattern.matcher(content);

        java.util.Set<String> processedUsernames = new java.util.HashSet<>();

        while (matcher.find()) {
            String username = matcher.group(1);
            if (processedUsernames.contains(username))
                continue;
            processedUsernames.add(username);

            userRepo.findByUsernameIgnoreCase(username).ifPresent(mentionedUser -> {
                if (!mentionedUser.getId().equals(actor.getId())) { // Don't notify self
                    Mention mention = new Mention(mentionedUser, actor, contentId, type);
                    mentionRepository.save(mention);

                    // Send Notification
                    String message = actor.getActualUsername() + " mentioned you in a " + type.name().toLowerCase();
                    notificationService.createNotification(
                            mentionedUser,
                            actor,
                            com.Blog.Platform.User.Model.NotificationType.MENTION,
                            contentId.toString(),
                            message);
                }
            });
        }
    }
}
