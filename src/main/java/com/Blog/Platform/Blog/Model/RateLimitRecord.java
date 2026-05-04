package com.Blog.Platform.Blog.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rate_limits")
@Getter
@Setter
public class RateLimitRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_ip", nullable = false, length = 50)
    private String clientIp;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "api_path", nullable = false, length = 200)
    private String apiPath;

    @Column(name = "request_count", nullable = false)
    private int requestCount = 1;

    @Column(name = "window_start", nullable = false)
    private LocalDateTime windowStart;
}
