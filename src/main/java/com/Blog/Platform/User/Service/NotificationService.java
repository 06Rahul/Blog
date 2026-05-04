package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.DTO.NotificationResponse;
import com.Blog.Platform.User.Model.Notification;
import com.Blog.Platform.User.Model.NotificationType;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.NotificationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    private final org.springframework.mail.javamail.JavaMailSender mailSender;

    public NotificationService(NotificationRepository notificationRepository,
            org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate,
            org.springframework.mail.javamail.JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
        this.mailSender = mailSender;
    }

    public void notifyModerationRejection(User user, String reason) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Your content was not published");
            message.setText("Your post was not published because: " + reason + ". Please review our community guidelines.");
            mailSender.send(message);
        } catch (Exception e) {
            // Log or ignore safely
        }
    }

    public void notifyCoauthorInvite(User recipient, User sender, String title, String token) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setTo(recipient.getEmail());
            message.setSubject("Co-Author Invitation: " + title);
            message.setText(sender.getActualUsername() + " has invited you to co-author '" + title + "'.\n\nAccept: http://localhost:8080/api/coauthors/accept?token=" + token + "\nDecline: http://localhost:8080/api/coauthors/decline?token=" + token);
            mailSender.send(message);
        } catch (Exception e) {}
    }

    public void notifyCoauthorAccept(User originalAuthor, User coauthor, String title) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setTo(originalAuthor.getEmail());
            message.setSubject("Co-Author Accepted");
            message.setText("User " + coauthor.getActualUsername() + " accepted your co-author invitation for '" + title + "'.");
            mailSender.send(message);
        } catch (Exception e) {}
    }

    @Transactional
    public void createNotification(User recipient, User sender, NotificationType type, String referenceId,
            String message) {
        if (recipient.getId().equals(sender.getId()))
            return; // Don't notify self

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSender(sender);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setMessage(message);
        Notification saved = notificationRepository.save(notification);

        NotificationResponse payload = toResponse(saved);
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/notifications",
                payload);
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/notification-count",
                getUnreadCount(recipient));
    }

    public List<NotificationResponse> getUserNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(UUID notificationId, User user) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (!notification.getRecipient().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Notification does not belong to the current user");
            }
            notification.setRead(true);
            notificationRepository.save(notification);
            messagingTemplate.convertAndSendToUser(
                    user.getEmail(),
                    "/queue/notification-count",
                    getUnreadCount(user));
        });
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notification-count",
                0L);
    }

    private NotificationResponse toResponse(Notification notification) {
        User sender = notification.getSender();
        String displayName = (sender.getFirstName() + " " + java.util.Optional.ofNullable(sender.getLastName()).orElse("")).trim();
        if (displayName.isBlank()) {
            displayName = sender.getActualUsername();
        }

        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getReferenceId(),
                notification.getMessage(),
                notification.isRead(),
                resolveRoute(notification),
                notification.getCreatedAt(),
                new NotificationResponse.SenderSummary(
                        sender.getId(),
                        sender.getActualUsername(),
                        displayName,
                        sender.getProfileImageUrl()
                )
        );
    }

    private String resolveRoute(Notification notification) {
        if (notification.getReferenceId() == null || notification.getReferenceId().isBlank()) {
            return null;
        }

        return switch (notification.getType()) {
            case NEW_POST, MENTION_BLOG, COMMENT, LIKE -> "/blogs/" + notification.getReferenceId();
            case FOLLOW -> "/profile/" + notification.getSender().getActualUsername();
            case MENTION, NEW_THREAD, THREAD_REPLY, REPLY -> "/threads/" + notification.getReferenceId();
            case NEW_MESSAGE -> "/messages/" + notification.getReferenceId();
        };
    }
}
