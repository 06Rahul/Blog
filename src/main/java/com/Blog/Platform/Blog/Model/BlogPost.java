package com.Blog.Platform.Blog.Model;

import com.Blog.Platform.Community.Model.Community;
import com.Blog.Platform.User.Model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "blog_posts")
@Data
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    // summary field
    @Column(columnDefinition = "TEXT")
    private String summary;

    private String coverImageUrl;

    @Column(name = "reading_time")
    private Integer readingTime = 0;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private BlogStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status", length = 20)
    private com.Blog.Platform.AiService.Model.ModerationStatus moderationStatus = com.Blog.Platform.AiService.Model.ModerationStatus.APPROVED;

    @Column(name = "moderation_reason", length = 500)
    private String moderationReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    @Column(name = "community_exclusive", nullable = false)
    private boolean communityExclusive = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "poll_id")
    private UUID pollId;

    private LocalDateTime publishedAt;

    @Column(name = "publish_at")
    private LocalDateTime publishAt;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToMany
    @JoinTable(
            name = "blog_tags",
            joinColumns = @JoinColumn(name = "blog_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

}

