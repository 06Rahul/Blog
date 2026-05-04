package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.User.Model.PendingUser;
import com.Blog.Platform.User.Repo.PendingUserRepo;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ScheduledCleanupService {

    private static final Logger log = LoggerFactory.getLogger(ScheduledCleanupService.class);

    private final PendingUserRepo pendingUserRepo;
    private final FileStorageServiceImpl fileStorageService;

    public ScheduledCleanupService(PendingUserRepo pendingUserRepo, FileStorageServiceImpl fileStorageService) {
        this.pendingUserRepo = pendingUserRepo;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Cleanup expired pending users and their temporary profile images
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at minute 0
    @Transactional
    public void cleanupExpiredPendingUsers() {
        LocalDateTime now = LocalDateTime.now();

        log.info("Starting cleanup of expired pending users...");

        // Find all expired pending users
        List<PendingUser> expiredUsers = pendingUserRepo.findByExpiresAtBefore(now);

        if (expiredUsers.isEmpty()) {
            log.info("No expired pending users found");
            return;
        }

        int cleanedUpCount = 0;
        int imagesCleanedCount = 0;

        // Delete temporary images and pending users
        for (PendingUser pendingUser : expiredUsers) {
            try {
                // Delete temporary profile image if exists
                if (pendingUser.getTempProfileImagePath() != null) {
                    fileStorageService.deleteTempImage(pendingUser.getTempProfileImagePath());
                    imagesCleanedCount++;
                }

                // Delete pending user record
                pendingUserRepo.delete(pendingUser);
                cleanedUpCount++;

                log.debug("Cleaned up expired pending user: {}", pendingUser.getEmail());
            } catch (Exception e) {
                log.error("Error cleaning up pending user {}: {}",
                        pendingUser.getEmail(), e.getMessage(), e);
            }
        }

        log.info("Cleanup completed: {} expired pending users deleted, {} temp images removed",
                cleanedUpCount, imagesCleanedCount);
    }

    /**
     * Alternative method using repository delete query
     * Can be used instead of the above method for better performance
     */
    @Transactional
    public void cleanupExpiredPendingUsersAlternative() {
        LocalDateTime now = LocalDateTime.now();

        log.info("Starting bulk cleanup of expired pending users...");

        // Note: This won't clean up temp images, so use the above method if images need
        // cleanup
        pendingUserRepo.deleteByExpiresAtBefore(now);

        log.info("Bulk cleanup completed");
    }
}
