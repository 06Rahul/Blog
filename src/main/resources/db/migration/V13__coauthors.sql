CREATE TABLE post_coauthors (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    blog_id VARCHAR(36) NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_by VARCHAR(36) NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, ACCEPTED, DECLINED
    invited_at DATETIME DEFAULT NOW(),
    responded_at DATETIME NULL,
    UNIQUE KEY uq_coauthor (blog_id, user_id)
);
