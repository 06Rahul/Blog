CREATE TABLE blog_metadata (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blog_id BINARY(16) NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    weight FLOAT DEFAULT 1.0,
    CONSTRAINT fk_blog_meta_blog FOREIGN KEY (blog_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    INDEX idx_blog_meta_blog (blog_id),
    INDEX idx_blog_meta_keyword (keyword)
);
