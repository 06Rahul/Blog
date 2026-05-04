CREATE TABLE post_views (
    id VARCHAR(36) PRIMARY KEY,
    blog_id BINARY(16) NOT NULL,
    user_id BINARY(16) NULL,
    session_id VARCHAR(64) NOT NULL,
    viewed_at DATETIME DEFAULT NOW(),
    referrer VARCHAR(500) NULL,
    CONSTRAINT fk_views_blog FOREIGN KEY (blog_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_views_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_views_blog (blog_id),
    INDEX idx_views_date (blog_id, viewed_at)
);
