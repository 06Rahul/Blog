package com.Blog.Platform.Discovery.Service;

import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Mapper.BlogPostMapper;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Discovery.DTO.CommunityLeaderboardEntry;
import com.Blog.Platform.Discovery.DTO.CreatorLeaderboardEntry;
import com.Blog.Platform.Discovery.DTO.TrendingPostEntry;
import com.Blog.Platform.User.Model.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscoveryInsightsService {

    private static final LocalDateTime NOW_FALLBACK = LocalDateTime.now();

    private final BlogPostRepository blogPostRepository;
    private final BlogPostMapper blogPostMapper;

    @PersistenceContext
    private EntityManager entityManager;

    public List<CreatorLeaderboardEntry> getCreatorLeaderboard(String window, UUID categoryId, boolean risingOnly, int limit) {
        LocalDateTime periodStart = resolveWindowStart(window);
        LocalDateTime risingThreshold = LocalDateTime.now().minusDays(30);

        String categoryExists = categoryId != null ? " AND bp.category_id = :categoryId" : "";
        List<Object[]> creatorRows = runQuery(
                "SELECT DISTINCT u.id, u.username, u.first_name, u.last_name, u.created_at " +
                        "FROM users u " +
                        "WHERE EXISTS (SELECT 1 FROM blog_posts bp WHERE bp.author_id = u.id AND bp.status = 'PUBLISHED'" + categoryExists + ")",
                params(periodStart, categoryId)
        );

        Map<UUID, Long> views = countById(
                "SELECT bp.author_id, COUNT(*) FROM post_views pv " +
                        "JOIN blog_posts bp ON bp.id = pv.blog_id " +
                        "WHERE bp.status = 'PUBLISHED'" +
                        withSince("pv.viewed_at", periodStart) +
                        withCategory(categoryId) +
                        " GROUP BY bp.author_id",
                params(periodStart, categoryId)
        );
        Map<UUID, Long> reads = countById(
                "SELECT bp.author_id, COUNT(*) FROM read_history rh " +
                        "JOIN blog_posts bp ON bp.id = rh.blog_id " +
                        "WHERE bp.status = 'PUBLISHED' AND rh.completed = true" +
                        withSince("rh.created_at", periodStart) +
                        withCategory(categoryId) +
                        " GROUP BY bp.author_id",
                params(periodStart, categoryId)
        );
        Map<UUID, Long> likes = countById(
                "SELECT bp.author_id, COUNT(*) FROM blog_likes bl " +
                        "JOIN blog_posts bp ON bp.id = bl.blog_id " +
                        "WHERE bp.status = 'PUBLISHED'" +
                        withSince("bl.created_at", periodStart) +
                        withCategory(categoryId) +
                        " GROUP BY bp.author_id",
                params(periodStart, categoryId)
        );
        Map<UUID, Long> comments = countById(
                "SELECT bp.author_id, COUNT(*) FROM comments c " +
                        "JOIN blog_posts bp ON bp.id = c.blog_id " +
                        "WHERE bp.status = 'PUBLISHED' AND c.moderation_status = 'APPROVED'" +
                        withSince("c.created_at", periodStart) +
                        withCategory(categoryId) +
                        " GROUP BY bp.author_id",
                params(periodStart, categoryId)
        );
        Map<UUID, Long> followers = countById(
                "SELECT f.following_id, COUNT(*) FROM follows f WHERE 1=1" +
                        withSince("f.created_at", periodStart) +
                        " GROUP BY f.following_id",
                params(periodStart, categoryId)
        );

        return creatorRows.stream()
                .map(row -> {
                    UUID userId = asUuid(row[0]);
                    LocalDateTime createdAt = asDateTime(row[4]);
                    boolean rising = createdAt != null && createdAt.isAfter(risingThreshold);
                    long viewCount = views.getOrDefault(userId, 0L);
                    long readCount = reads.getOrDefault(userId, 0L);
                    long likeCount = likes.getOrDefault(userId, 0L);
                    long commentCount = comments.getOrDefault(userId, 0L);
                    long followerCount = followers.getOrDefault(userId, 0L);
                    double score = (viewCount * 1.0) + (readCount * 4.0) + (likeCount * 3.0) + (commentCount * 5.0) + (followerCount * 6.0);
                    String firstName = Objects.toString(row[2], "");
                    String lastName = Objects.toString(row[3], "");
                    String displayName = (firstName + " " + lastName).trim();
                    if (displayName.isBlank()) {
                        displayName = Objects.toString(row[1], "");
                    }
                    return new CreatorLeaderboardEntry(
                            userId,
                            Objects.toString(row[1], ""),
                            displayName,
                            viewCount,
                            readCount,
                            likeCount,
                            commentCount,
                            followerCount,
                            score,
                            rising
                    );
                })
                .filter(entry -> !risingOnly || entry.rising())
                .sorted(Comparator.comparingDouble(CreatorLeaderboardEntry::score).reversed())
                .limit(Math.max(1, limit))
                .toList();
    }

    public List<CommunityLeaderboardEntry> getCommunityLeaderboard(String window, boolean risingOnly, int limit) {
        LocalDateTime periodStart = resolveWindowStart(window);
        LocalDateTime risingThreshold = LocalDateTime.now().minusDays(30);

        List<Object[]> communities = runQuery(
                "SELECT c.id, c.name, u.username, c.created_at, " +
                        "(SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id AND cm.status = 'ACCEPTED') AS member_count " +
                        "FROM communities c JOIN users u ON u.id = c.owner_id",
                params(periodStart, null)
        );

        Map<UUID, Long> joins = countById(
                "SELECT cm.community_id, COUNT(*) FROM community_members cm " +
                        "WHERE cm.status = 'ACCEPTED'" +
                        withSince("cm.joined_at", periodStart) +
                        " GROUP BY cm.community_id",
                params(periodStart, null)
        );
        Map<UUID, Long> threads = countById(
                "SELECT dt.community_id, COUNT(*) FROM discussion_threads dt " +
                        "WHERE 1=1" +
                        withSince("dt.created_at", periodStart) +
                        " GROUP BY dt.community_id",
                params(periodStart, null)
        );
        Map<UUID, Long> replies = countById(
                "SELECT dt.community_id, COUNT(*) FROM thread_replies tr " +
                        "JOIN discussion_threads dt ON dt.id = tr.thread_id " +
                        "WHERE 1=1" +
                        withSince("tr.created_at", periodStart) +
                        " GROUP BY dt.community_id",
                params(periodStart, null)
        );

        return communities.stream()
                .map(row -> {
                    UUID communityId = asUuid(row[0]);
                    LocalDateTime createdAt = asDateTime(row[3]);
                    boolean rising = createdAt != null && createdAt.isAfter(risingThreshold);
                    long memberCount = asLong(row[4]);
                    long joinCount = joins.getOrDefault(communityId, 0L);
                    long threadCount = threads.getOrDefault(communityId, 0L);
                    long replyCount = replies.getOrDefault(communityId, 0L);
                    double score = (memberCount * 2.0) + (joinCount * 5.0) + (threadCount * 4.0) + (replyCount * 3.0);
                    return new CommunityLeaderboardEntry(
                            communityId,
                            Objects.toString(row[1], ""),
                            Objects.toString(row[2], ""),
                            memberCount,
                            joinCount,
                            threadCount,
                            replyCount,
                            score,
                            rising
                    );
                })
                .filter(entry -> !risingOnly || entry.rising())
                .sorted(Comparator.comparingDouble(CommunityLeaderboardEntry::score).reversed())
                .limit(Math.max(1, limit))
                .toList();
    }

    public List<TrendingPostEntry> getTrendingPosts(String window, UUID categoryId, int limit, User currentUser) {
        LocalDateTime periodStart = resolveWindowStart(window);
        String sql = "SELECT bp.id, bp.published_at FROM blog_posts bp " +
                "WHERE bp.status = 'PUBLISHED'" +
                (periodStart != null ? " AND bp.published_at >= :periodStart" : "") +
                (categoryId != null ? " AND bp.category_id = :categoryId" : "");

        List<Object[]> postRows = runQuery(sql, params(periodStart, categoryId));
        if (postRows.isEmpty()) {
            return List.of();
        }

        Map<UUID, Long> views = countById(
                "SELECT pv.blog_id, COUNT(*) FROM post_views pv " +
                        "JOIN blog_posts bp ON bp.id = pv.blog_id " +
                        "WHERE bp.status = 'PUBLISHED'" +
                        withSince("pv.viewed_at", periodStart) +
                        withCategory(categoryId) +
                        " GROUP BY pv.blog_id",
                params(periodStart, categoryId)
        );
        Map<UUID, Long> reads = countById(
                "SELECT rh.blog_id, COUNT(*) FROM read_history rh " +
                        "JOIN blog_posts bp ON bp.id = rh.blog_id " +
                        "WHERE bp.status = 'PUBLISHED' AND rh.completed = true" +
                        withSince("rh.created_at", periodStart) +
                        withCategory(categoryId) +
                        " GROUP BY rh.blog_id",
                params(periodStart, categoryId)
        );
        Map<UUID, Long> likes = countById(
                "SELECT bl.blog_id, COUNT(*) FROM blog_likes bl " +
                        "JOIN blog_posts bp ON bp.id = bl.blog_id " +
                        "WHERE bp.status = 'PUBLISHED'" +
                        withSince("bl.created_at", periodStart) +
                        withCategory(categoryId) +
                        " GROUP BY bl.blog_id",
                params(periodStart, categoryId)
        );
        Map<UUID, Long> comments = countById(
                "SELECT c.blog_id, COUNT(*) FROM comments c " +
                        "JOIN blog_posts bp ON bp.id = c.blog_id " +
                        "WHERE bp.status = 'PUBLISHED' AND c.moderation_status = 'APPROVED'" +
                        withSince("c.created_at", periodStart) +
                        withCategory(categoryId) +
                        " GROUP BY c.blog_id",
                params(periodStart, categoryId)
        );
        Map<UUID, Long> saves = countById(
                "SELECT sb.blog_id, COUNT(*) FROM saved_blogs sb " +
                        "JOIN blog_posts bp ON bp.id = sb.blog_id " +
                        "WHERE bp.status = 'PUBLISHED'" +
                        withSince("sb.saved_at", periodStart) +
                        withCategory(categoryId) +
                        " GROUP BY sb.blog_id",
                params(periodStart, categoryId)
        );

        Set<UUID> followedAuthorIds = currentUser == null ? Set.of() : countById(
                "SELECT f.following_id, COUNT(*) FROM follows f WHERE f.follower_id = :currentUserId GROUP BY f.following_id",
                Map.of("currentUserId", currentUser.getId())
        ).keySet();

        Set<UUID> joinedCommunityIds = currentUser == null ? Set.of() : countById(
                "SELECT cm.community_id, COUNT(*) FROM community_members cm WHERE cm.user_id = :currentUserId AND cm.status = 'ACCEPTED' GROUP BY cm.community_id",
                Map.of("currentUserId", currentUser.getId())
        ).keySet();

        Set<String> interestTokens = currentUser == null || currentUser.getInterests() == null
                ? Set.of()
                : Arrays.stream(currentUser.getInterests().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(token -> !token.isBlank())
                .collect(Collectors.toSet());

        Map<UUID, BlogPost> postMap = blogPostRepository.findAllById(
                postRows.stream().map(row -> asUuid(row[0])).toList()
        ).stream().collect(Collectors.toMap(BlogPost::getId, Function.identity()));

        return postRows.stream()
                .map(row -> {
                    UUID blogId = asUuid(row[0]);
                    BlogPost post = postMap.get(blogId);
                    if (post == null) {
                        return null;
                    }

                    long viewCount = views.getOrDefault(blogId, 0L);
                    long readCount = reads.getOrDefault(blogId, 0L);
                    long likeCount = likes.getOrDefault(blogId, 0L);
                    long commentCount = comments.getOrDefault(blogId, 0L);
                    long saveCount = saves.getOrDefault(blogId, 0L);

                    double rawScore = (viewCount * 1.0) + (readCount * 4.0) + (likeCount * 3.0) + (commentCount * 5.0) + (saveCount * 4.0);
                    double ageHours = Math.max(1.0, java.time.Duration.between(
                            post.getPublishedAt() != null ? post.getPublishedAt() : post.getCreatedAt(),
                            LocalDateTime.now()
                    ).toHours());
                    double score = rawScore / Math.pow(ageHours + 2.0, 1.15);

                    if (currentUser != null) {
                        if (followedAuthorIds.contains(post.getAuthor().getId())) {
                            score += 2.5;
                        }
                        if (post.getCommunity() != null && joinedCommunityIds.contains(post.getCommunity().getId())) {
                            score += 1.5;
                        }
                        if (!interestTokens.isEmpty()) {
                            long matches = post.getTags().stream()
                                    .map(tag -> tag.getName().toLowerCase())
                                    .filter(interestTokens::contains)
                                    .count();
                            score += Math.min(2.0, matches * 0.75);
                        }
                    }

                    BlogPostResponse response = blogPostMapper.toResponse(post);
                    return new TrendingPostEntry(response, viewCount, readCount, likeCount, commentCount, saveCount, score);
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(TrendingPostEntry::score).reversed())
                .limit(Math.max(1, limit))
                .toList();
    }

    public Page<BlogPostResponse> getTrendingPostPage(String window, UUID categoryId, Pageable pageable, User currentUser) {
        List<TrendingPostEntry> ranked = getTrendingPosts(window, categoryId, Math.max(pageable.getPageSize() * (pageable.getPageNumber() + 1), 50), currentUser);
        int fromIndex = Math.min((int) pageable.getOffset(), ranked.size());
        int toIndex = Math.min(fromIndex + pageable.getPageSize(), ranked.size());
        List<BlogPostResponse> content = ranked.subList(fromIndex, toIndex).stream()
                .map(TrendingPostEntry::post)
                .toList();
        return new PageImpl<>(content, pageable, ranked.size());
    }

    private Map<String, Object> params(LocalDateTime periodStart, UUID categoryId) {
        Map<String, Object> params = new HashMap<>();
        if (periodStart != null) {
            params.put("periodStart", periodStart);
        }
        if (categoryId != null) {
            params.put("categoryId", categoryId);
        }
        return params;
    }

    private String withSince(String column, LocalDateTime periodStart) {
        return periodStart == null ? "" : " AND " + column + " >= :periodStart";
    }

    private String withCategory(UUID categoryId) {
        return categoryId == null ? "" : " AND bp.category_id = :categoryId";
    }

    private Map<UUID, Long> countById(String sql, Map<String, Object> params) {
        return runQuery(sql, params).stream()
                .collect(Collectors.toMap(
                        row -> asUuid(row[0]),
                        row -> asLong(row[1])
                ));
    }

    private List<Object[]> runQuery(String sql, Map<String, Object> params) {
        var query = entityManager.createNativeQuery(sql);
        params.forEach(query::setParameter);
        @SuppressWarnings("unchecked")
        List<Object[]> result = query.getResultList();
        return result;
    }

    private LocalDateTime resolveWindowStart(String window) {
        if (window == null) {
            return NOW_FALLBACK.minusDays(7);
        }
        return switch (window.toLowerCase()) {
            case "today" -> LocalDateTime.now().minusDays(1);
            case "week" -> LocalDateTime.now().minusDays(7);
            case "month" -> LocalDateTime.now().minusDays(30);
            case "all-time", "alltime", "all_time" -> null;
            default -> LocalDateTime.now().minusDays(7);
        };
    }

    private UUID asUuid(Object value) {
        if (value instanceof UUID uuid) {
            return uuid;
        }
        return UUID.fromString(String.valueOf(value));
    }

    private long asLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }

    private LocalDateTime asDateTime(Object value) {
        if (value instanceof LocalDateTime time) {
            return time;
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        return null;
    }
}
