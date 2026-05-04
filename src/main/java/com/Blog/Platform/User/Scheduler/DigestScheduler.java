package com.Blog.Platform.User.Scheduler;

import com.Blog.Platform.AiService.Service.AiService;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.User.DTO.PostTeaser;
import com.Blog.Platform.User.Model.DigestLog;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.DigestLogRepository;
import com.Blog.Platform.User.Repo.UserRepo;
import com.Blog.Platform.User.Service.DigestService;
import com.Blog.Platform.User.Service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DigestScheduler {

    private final UserRepo userRepo;
    private final DigestService digestService;
    private final AiService geminiAiService;
    private final EmailService emailService;
    private final DigestLogRepository digestLogRepo;

    @Scheduled(cron = "0 0 8 * * MON", zone = "UTC")
    public void sendWeeklyDigests() {
        List<User> subscribers = userRepo.findByDigestEnabledTrue();
        subscribers.forEach(user -> {
            try {
                List<BlogPost> posts = digestService.getPostsForUser(user);
                if (posts.isEmpty()) return;
                
                List<PostTeaser> teasers = posts.stream().map(p ->
                        new PostTeaser(p, geminiAiService.generateTeaser(p.getTitle(), p.getContent()))
                ).toList();
                
                emailService.sendDigestEmail(user.getEmail(), teasers); // Ensure emailService supports this!
                
                digestLogRepo.save(new DigestLog(user, LocalDateTime.now(), posts.size()));
                
                user.setDigestLastSent(LocalDateTime.now());
                userRepo.save(user);
                
            } catch (Exception e) {
                log.error("Digest failed for {}: {}", user.getEmail(), e.getMessage());
            }
        });
    }
}
