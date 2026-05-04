CREATE TABLE digest_log (
    id VARCHAR(36) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    sent_at DATETIME NOT NULL,
    post_count INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_digest_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN digest_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN digest_last_sent DATETIME NULL;
