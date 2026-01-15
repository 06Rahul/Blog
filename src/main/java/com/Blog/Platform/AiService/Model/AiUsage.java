package com.Blog.Platform.AiService.Model;

import com.Blog.Platform.User.Model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "ai_usage",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "usage_date", "feature"})
        }
)
@Data
public class AiUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "usage_date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AiFeature feature;

    @Column(nullable = false)
    private int count;
}
