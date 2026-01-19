package com.Blog.Platform.User.Model;

import com.Blog.Platform.Blog.Model.BlogPost;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saved_blogs", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "blog_id" })
})
@Data
@NoArgsConstructor
public class SavedBlog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private BlogPost blog;

    @CreationTimestamp
    private LocalDateTime savedAt;

    public SavedBlog(User user, BlogPost blog) {
        this.user = user;
        this.blog = blog;
    }
}
