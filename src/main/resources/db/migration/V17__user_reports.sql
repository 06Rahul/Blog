CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    reporter_id VARCHAR(36) NOT NULL,
    reported_item_id VARCHAR(36) NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'LOW',
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);
