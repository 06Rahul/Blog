CREATE TABLE read_history (
    id VARCHAR(36) PRIMARY KEY,
    blog_id BINARY(16) NOT NULL,
    user_id BINARY(16) NULL,
    session_id VARCHAR(64) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT NOW(),
    CONSTRAINT fk_read_blog FOREIGN KEY (blog_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    INDEX idx_read_blog (blog_id)
);
