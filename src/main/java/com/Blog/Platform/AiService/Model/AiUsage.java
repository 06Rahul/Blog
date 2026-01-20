package com.Blog.Platform.AiService.Model;

import com.Blog.Platform.User.Model.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "ai_usage", uniqueConstraints = {
                @UniqueConstraint(columnNames = { "user_id", "usage_date", "feature" })
})
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

        public UUID getId() {
                return id;
        }

        public void setId(UUID id) {
                this.id = id;
        }

        public User getUser() {
                return user;
        }

        public void setUser(User user) {
                this.user = user;
        }

        public LocalDate getDate() {
                return date;
        }

        public void setDate(LocalDate date) {
                this.date = date;
        }

        public AiFeature getFeature() {
                return feature;
        }

        public void setFeature(AiFeature feature) {
                this.feature = feature;
        }

        public int getCount() {
                return count;
        }

        public void setCount(int count) {
                this.count = count;
        }
}
