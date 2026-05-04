CREATE TABLE user_tag_affinity (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    affinity_score FLOAT DEFAULT 1.0,
    last_interacted_at DATETIME DEFAULT NOW(),
    UNIQUE KEY uq_user_tag (user_id, tag)
);
