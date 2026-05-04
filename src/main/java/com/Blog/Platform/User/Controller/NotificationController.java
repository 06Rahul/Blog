package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.DTO.NotificationGroupResponse;
import com.Blog.Platform.User.DTO.NotificationPreferenceResponse;
import com.Blog.Platform.User.DTO.NotificationPreferenceUpdateRequest;
import com.Blog.Platform.User.DTO.NotificationResponse;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Service.NotificationService;
import com.Blog.Platform.User.Service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotifications() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user));
    }

    @GetMapping("/grouped")
    public ResponseEntity<List<NotificationGroupResponse>> getGroupedNotifications() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getGroupedNotifications(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<java.util.Map<String, Long>> getUnreadCount() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(java.util.Map.of("unreadCount", notificationService.getUnreadCount(user)));
    }

    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> getPreferences() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getPreferences(user));
    }

    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> updatePreferences(@RequestBody NotificationPreferenceUpdateRequest request) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(notificationService.updatePreferences(user, request));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable UUID id) {
        User user = userService.getCurrentUser();
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        User user = userService.getCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }
}
