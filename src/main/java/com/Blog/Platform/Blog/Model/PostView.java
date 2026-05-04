package com.Blog.Platform.Blog.Model;

import com.Blog.Platform.User.Model.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "post_views",
    indexes = {
        @Index(name = "idx_views_blog", columnList = "blog_id"),
        @Index(name = "idx_views_date", columnList = "blog_id, viewed_at")
    }
)
@Data
@NoArgsConstructor
public class PostView {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id; // VARCHAR(36) in MySQL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private BlogPost blog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;

    @Column(length = 500)
    private String referrer;

    @CreationTimestamp
    @Column(name = "viewed_at", updatable = false)
    private LocalDateTime viewedAt;

    public PostView(BlogPost blog, User user, String sessionId, String referrer) {
        this.blog = blog;
        this.user = user;
        this.sessionId = sessionId;
        this.referrer = referrer;
    }
}
