CREATE TABLE credit_ledger (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blog_id VARCHAR(36) NULL REFERENCES blog_posts(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount INT NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    reference_id VARCHAR(36) NULL, -- Can be comment id, read history id etc
    INDEX idx_credit_user (user_id),
    INDEX idx_credit_blog (blog_id)
);
