package com.Blog.Platform.Poll.Model;

import com.Blog.Platform.User.Model.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(
    name = "poll_votes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"poll_id", "user_id"})
)
public class PollVote {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private PollOption option;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime votedAt;

    public PollVote() {}
    public PollVote(Poll poll, PollOption option, User user) {
        this.poll = poll;
        this.option = option;
        this.user = user;
    }
}
