package com.Blog.Platform.Blog.ServiceImpl;

import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.PostView;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Repo.PostViewRepository;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostViewService {

    private final PostViewRepository viewRepo;
    private final BlogPostRepository blogRepo;
    private final UserRepo userRepo;
    private final com.Blog.Platform.User.Service.VirtualKudosService kudosService;
    private final com.Blog.Platform.Blog.Service.RelevanceFeedService relevanceFeedService;

    @Async
    @Transactional
    public void recordView(UUID blogId, UUID userId, String sessionId, String referrer) {
        boolean recent = viewRepo.existsByBlogIdAndSessionIdAndViewedAtAfter(
                blogId, sessionId, LocalDateTime.now().minusMinutes(30));
        
        if (!recent) {
            BlogPost blog = blogRepo.findById(blogId).orElse(null);
            if (blog != null) {
                User user = null;
                if (userId != null) {
                    user = userRepo.findById(userId).orElse(null);
                }
                PostView savedView = viewRepo.save(new PostView(blog, user, sessionId, referrer));
                if (userId != null) {
                    kudosService.awardPoints(userId, blogId, com.Blog.Platform.User.Model.TransactionType.EARN_READ, 5, savedView.getId());
                    relevanceFeedService.recordAffinity(userId, blog.getTags(), 1.0f);
                }
            }
        }
    }
}
