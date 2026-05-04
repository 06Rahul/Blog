package com.Blog.Platform.Blog.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tag_stats")
@Getter
@Setter
public class TagStat {
    @Id
    @Column(name = "tag_name", length = 100)
    private String tagName;

    @Column(name = "views_24h")
    private int views24h;

    @Column(name = "views_7d")
    private int views7d;

    @Column(name = "total_views")
    private int totalViews;

    @Column(name = "last_calculated")
    private LocalDateTime lastCalculated;
}
