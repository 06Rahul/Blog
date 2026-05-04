package com.Blog.Platform.User.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "digest_log")
@Data
@NoArgsConstructor
public class DigestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "post_count", nullable = false)
    private int postCount = 0;

    public DigestLog(User user, LocalDateTime sentAt, int postCount) {
        this.user = user;
        this.sentAt = sentAt;
        this.postCount = postCount;
    }
}
