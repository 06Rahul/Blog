package com.Blog.Platform.Blog.ServiceImpl;

import com.Blog.Platform.Blog.DTO.AggregatedAnalyticsResponse;
import com.Blog.Platform.Blog.DTO.AnalyticsResponse;
import com.Blog.Platform.Blog.DTO.ReferrerDto;
import com.Blog.Platform.Blog.DTO.WeeklyTrendDto;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Repo.AnalyticsRepository;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Repository.CommentRepository;
import com.Blog.Platform.Blog.Repository.LikeRepository;
import com.Blog.Platform.User.Model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepo;
    private final BlogPostRepository blogRepo;
    private final LikeRepository likeRepo;
    private final CommentRepository commentRepo;

    public AnalyticsResponse getPostAnalytics(UUID blogId, User author) {
        BlogPost blog = blogRepo.findById(blogId).orElseThrow(() -> new IllegalArgumentException("Blog not found"));
        if (!blog.getAuthor().getId().equals(author.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }

        long totalViews = analyticsRepo.getTotalViews(blogId);
        long uniqueReaders = analyticsRepo.getUniqueReaders(blogId);
        double completionRate = analyticsRepo.getCompletionRate(blogId);
        
        List<WeeklyTrendDto> weeklyTrend = analyticsRepo.getWeeklyTrend(blogId, LocalDateTime.now().minusDays(7)).stream()
                .map(proj -> new WeeklyTrendDto(proj.getDay().toString(), proj.getViews()))
                .collect(Collectors.toList());

        List<ReferrerDto> topReferrers = analyticsRepo.getTopReferrers(blogId, PageRequest.of(0, 5)).stream()
                .map(proj -> new ReferrerDto(proj.getReferrer(), proj.getCount()))
                .collect(Collectors.toList());

        long likeCount = likeRepo.countByBlog(blog);
        long commentCount = commentRepo.countByBlog_Id(blogId);
        long tipCount = 0; // TODO: Implement Tip Count when Kudos System is ready
        long totalKudos = 0; // TODO: Implement Kudos Count when Kudos System is ready

        return new AnalyticsResponse(totalViews, uniqueReaders, completionRate, weeklyTrend, topReferrers, likeCount, commentCount, tipCount, totalKudos);
    }

    public AggregatedAnalyticsResponse getAggregatedAnalytics(User author, int days) {
        LocalDateTime periodStart = LocalDateTime.now().minusDays(days);
        
        long totalViews = analyticsRepo.getTotalViewsForAuthor(author.getId(), periodStart);
        long totalUniqueReaders = analyticsRepo.getUniqueReadersForAuthor(author.getId(), periodStart);

        List<AnalyticsRepository.TopPostProjection> topPosts = analyticsRepo.getTopPostForAuthor(author.getId(), periodStart, PageRequest.of(0, 1));
        AggregatedAnalyticsResponse.TopPostDto topPostDto = null;
        if (!topPosts.isEmpty()) {
            AnalyticsRepository.TopPostProjection top = topPosts.get(0);
            topPostDto = new AggregatedAnalyticsResponse.TopPostDto(top.getBlogId(), top.getTitle(), top.getViews());
        }

        long totalKudosEarned = 0; // TODO: Implement Kudos calculation
        double avgReadCompletionRate = analyticsRepo.getAverageCompletionRateForAuthor(author.getId(), periodStart);
        double estimatedEarnings = (totalViews * 0.05) + (totalKudosEarned * 0.50);

        return new AggregatedAnalyticsResponse(totalViews, totalUniqueReaders, topPostDto, totalKudosEarned, estimatedEarnings, avgReadCompletionRate);
    }
}
