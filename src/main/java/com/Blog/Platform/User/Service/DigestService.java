package com.Blog.Platform.User.Service;

import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.BlogStatus;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.User.Model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DigestService {

    private final BlogPostRepository blogPostRepo;

    @Transactional(readOnly = true)
    public List<BlogPost> getPostsForUser(User user) {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        
        // Find top posts from followed authors
        List<BlogPost> followedPosts = blogPostRepo.findTopPostsFromFollowedAuthors(
                user.getId(), BlogStatus.PUBLISHED, com.Blog.Platform.AiService.Model.ModerationStatus.APPROVED, weekAgo);

        if (followedPosts.size() < 3) {
            // supplement with platform-wide top posts
            List<BlogPost> globalPosts = blogPostRepo.findGlobalTopPosts(
                    BlogStatus.PUBLISHED, com.Blog.Platform.AiService.Model.ModerationStatus.APPROVED, weekAgo);
            
            for (BlogPost post : globalPosts) {
                if (!followedPosts.contains(post)) {
                    followedPosts.add(post);
                    if(followedPosts.size() >= 7) break;
                }
            }
        }
        
        return followedPosts;
    }
}
