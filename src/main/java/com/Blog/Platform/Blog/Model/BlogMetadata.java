package com.Blog.Platform.Blog.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(
    name = "blog_metadata",
    indexes = {
        @Index(name = "idx_blog_meta_blog", columnList = "blog_id"),
        @Index(name = "idx_blog_meta_keyword", columnList = "keyword")
    }
)
@Data
@NoArgsConstructor
public class BlogMetadata {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "blog_id", nullable = false)
    private UUID blogId;

    @Column(nullable = false, length = 100)
    private String keyword;

    @Column(nullable = false)
    private Float weight = 1.0f;

    public BlogMetadata(UUID blogId, String keyword, Float weight) {
        this.blogId = blogId;
        this.keyword = keyword;
        this.weight = weight;
    }
}
