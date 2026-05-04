package com.Blog.Platform.Blog.Model;

import com.Blog.Platform.User.Model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "user_tag_affinity",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "tag"})
)
@Getter
@Setter
public class UserTagAffinity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String tag;

    @Column(name = "affinity_score", nullable = false)
    private float affinityScore = 1.0f;

    @Column(name = "last_interacted_at")
    private LocalDateTime lastInteractedAt;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.lastInteractedAt = LocalDateTime.now();
    }
}
