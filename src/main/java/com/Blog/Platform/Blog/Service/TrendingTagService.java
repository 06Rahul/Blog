package com.Blog.Platform.Blog.Service;

import com.Blog.Platform.Blog.Model.TagStat;
import com.Blog.Platform.Blog.Repo.TagStatRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrendingTagService {

    private final TagStatRepository tagStatRepository;
    private final EntityManager entityManager;

    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional
    public void calculateTrendingTags() {
        log.info("Calculating trending tags...");
        
        String sql = """
            INSERT INTO tag_stats (tag_name, views_24h, views_7d, total_views, last_calculated)
            SELECT t.name,
                   SUM(CASE WHEN pv.viewed_at >= NOW() - INTERVAL 1 DAY THEN 1 ELSE 0 END) AS v24,
                   SUM(CASE WHEN pv.viewed_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) AS v7,
                   COUNT(pv.id) AS total,
                   NOW()
            FROM tags t
            JOIN blog_tags bt ON t.id = bt.tag_id
            JOIN post_views pv ON bt.blog_id = pv.blog_id
            GROUP BY t.id, t.name
            ON DUPLICATE KEY UPDATE
                   views_24h = VALUES(views_24h),
                   views_7d = VALUES(views_7d),
                   total_views = VALUES(total_views),
                   last_calculated = VALUES(last_calculated)
        """;
        
        entityManager.createNativeQuery(sql).executeUpdate();
        log.info("Trending tags updated successfully.");
    }

    public List<TagStat> getTrendingTags(int limit) {
        return tagStatRepository.findAllByOrderByViews24hDesc(PageRequest.of(0, limit));
    }

    public List<TagStat> autocompleteTags(String query, int limit) {
        return tagStatRepository.findByTagNameContainingIgnoreCaseOrderByViews24hDesc(query, PageRequest.of(0, limit));
    }
}
