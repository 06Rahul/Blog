package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    Page<Report> findByStatus(String status, Pageable pageable);
    Page<Report> findByReporterId(UUID reporterId, Pageable pageable);
}
