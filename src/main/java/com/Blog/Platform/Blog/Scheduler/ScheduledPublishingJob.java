package com.Blog.Platform.Blog.Scheduler;

import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.BlogStatus;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.AiService.ServiceImpl.AsyncAiWorker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledPublishingJob {

    private final BlogPostRepository blogPostRepo;
    private final AsyncAiWorker asyncAiWorker;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Scheduled(cron = "0 * * * * *") // run every minute
    public void publishScheduledPosts() {
        List<BlogPost> duePosts = blogPostRepo.findByPublishAtBeforeAndStatus(
                LocalDateTime.now(), BlogStatus.SCHEDULED);

        duePosts.forEach(post -> {
            try {
                if (post.getModerationStatus() == com.Blog.Platform.AiService.Model.ModerationStatus.APPROVED) {
                    post.setStatus(BlogStatus.PUBLISHED);
                    post.setPublishedAt(LocalDateTime.now());
                    post.setPublishAt(null); // Clear schedule

                    BlogPost saved = blogPostRepo.save(post);
                    
                    asyncAiWorker.generateSummary(saved.getId(), saved.getContent());
                    applicationEventPublisher.publishEvent(new com.Blog.Platform.Blog.Event.BlogPublishedEvent(this, saved));
                    
                    log.info("Successfully published scheduled post: {}", saved.getId());
                } else {
                    log.warn("Skipping scheduled post {} due to pending/failed moderation.", post.getId());
                }
            } catch (Exception e) {
                log.error("Failed to publish scheduled post: {}", post.getId(), e);
            }
        });
    }
}
