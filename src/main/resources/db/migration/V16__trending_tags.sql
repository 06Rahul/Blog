CREATE TABLE tag_stats (
    tag_name VARCHAR(100) PRIMARY KEY,
    views_24h INT DEFAULT 0,
    views_7d INT DEFAULT 0,
    total_views INT DEFAULT 0,
    last_calculated DATETIME DEFAULT NOW()
);
