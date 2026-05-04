CREATE TABLE user_blocks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    blocker_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_at DATETIME DEFAULT NOW(),
    UNIQUE KEY uq_user_block (blocker_id, blocked_id)
);
