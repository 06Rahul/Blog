package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.DigestLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DigestLogRepository extends JpaRepository<DigestLog, String> {
}
