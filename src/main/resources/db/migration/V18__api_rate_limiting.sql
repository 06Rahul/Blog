CREATE TABLE rate_limits (
    id VARCHAR(36) PRIMARY KEY,
    client_ip VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NULL,
    api_path VARCHAR(200) NOT NULL,
    request_count INT DEFAULT 1,
    window_start DATETIME NOT NULL,
    INDEX idx_rate_limit_ip_path (client_ip, api_path),
    INDEX idx_rate_limit_user_path (user_id, api_path)
);
