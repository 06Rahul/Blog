package com.Blog.Platform.Blog.Repo;

import com.Blog.Platform.Blog.Model.PostView;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnalyticsRepository extends JpaRepository<PostView, String> {

    @Query("SELECT COUNT(v) FROM PostView v WHERE v.blog.id = :blogId")
    long getTotalViews(@Param("blogId") UUID blogId);

    @Query("SELECT COUNT(DISTINCT COALESCE(v.user.id, v.sessionId)) FROM PostView v WHERE v.blog.id = :blogId")
    long getUniqueReaders(@Param("blogId") UUID blogId);

    @Query("SELECT COALESCE(AVG(CASE WHEN r.completed = true THEN 1.0 ELSE 0.0 END)*100, 0.0) FROM ReadHistory r WHERE r.blog.id = :blogId")
    double getCompletionRate(@Param("blogId") UUID blogId);

    @Query("SELECT v.referrer as referrer, COUNT(v) as count FROM PostView v WHERE v.blog.id = :blogId AND v.referrer IS NOT NULL GROUP BY v.referrer ORDER BY COUNT(v) DESC")
    List<ReferrerCount> getTopReferrers(@Param("blogId") UUID blogId, Pageable pageable);

    interface ReferrerCount {
        String getReferrer();
        Long getCount();
    }

    @Query("SELECT FUNCTION('DATE', v.viewedAt) as day, COUNT(v) as views FROM PostView v WHERE v.blog.id = :blogId AND v.viewedAt >= :weekAgo GROUP BY FUNCTION('DATE', v.viewedAt)")
    List<WeeklyTrendProjection> getWeeklyTrend(@Param("blogId") UUID blogId, @Param("weekAgo") LocalDateTime weekAgo);

    interface WeeklyTrendProjection {
        java.sql.Date getDay();
        Long getViews();
    }

    @Query("SELECT COUNT(v) FROM PostView v WHERE v.blog.author.id = :authorId AND v.viewedAt >= :periodStart")
    long getTotalViewsForAuthor(@Param("authorId") UUID authorId, @Param("periodStart") LocalDateTime periodStart);

    @Query("SELECT COUNT(DISTINCT COALESCE(v.user.id, v.sessionId)) FROM PostView v WHERE v.blog.author.id = :authorId AND v.viewedAt >= :periodStart")
    long getUniqueReadersForAuthor(@Param("authorId") UUID authorId, @Param("periodStart") LocalDateTime periodStart);

    @Query("SELECT COALESCE(AVG(CASE WHEN r.completed = true THEN 1.0 ELSE 0.0 END)*100, 0.0) FROM ReadHistory r WHERE r.blog.author.id = :authorId AND r.createdAt >= :periodStart")
    double getAverageCompletionRateForAuthor(@Param("authorId") UUID authorId, @Param("periodStart") LocalDateTime periodStart);

    @Query("SELECT v.blog.id as blogId, v.blog.title as title, COUNT(v) as views FROM PostView v WHERE v.blog.author.id = :authorId AND v.viewedAt >= :periodStart GROUP BY v.blog.id, v.blog.title ORDER BY COUNT(v) DESC")
    List<TopPostProjection> getTopPostForAuthor(@Param("authorId") UUID authorId, @Param("periodStart") LocalDateTime periodStart, Pageable pageable);

    interface TopPostProjection {
        UUID getBlogId();
        String getTitle();
        Long getViews();
    }
}
