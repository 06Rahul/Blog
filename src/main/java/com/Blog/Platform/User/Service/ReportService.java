package com.Blog.Platform.User.Service;

import com.Blog.Platform.AiService.Service.AiService;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.Comment;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Repository.CommentRepository;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.Model.Report;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.ReportRepository;
import com.Blog.Platform.User.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepo userRepository;
    private final BlogPostRepository blogPostRepository;
    private final CommentRepository commentRepository;
    private final AiService aiService;

    public Report submitReport(UUID reportedItemId, String itemType, String reason) {
        UUID reporterId = SecurityUtil.getCurrentUserId();
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        String itemContent = "";
        if ("BLOG".equalsIgnoreCase(itemType)) {
            BlogPost post = blogPostRepository.findById(reportedItemId)
                    .orElseThrow(() -> new RuntimeException("Blog post not found"));
            itemContent = post.getContent();
        } else if ("COMMENT".equalsIgnoreCase(itemType)) {
            Comment comment = commentRepository.findById(reportedItemId)
                    .orElseThrow(() -> new RuntimeException("Comment not found"));
            itemContent = comment.getContent();
        } else {
            throw new IllegalArgumentException("Invalid itemType. Must be BLOG or COMMENT");
        }

        String severity = aiService.triageReport(reason, itemContent);

        Report report = new Report();
        report.setReporter(reporter);
        report.setReportedItemId(reportedItemId);
        report.setItemType(itemType.toUpperCase());
        report.setReason(reason);
        report.setSeverity(severity);
        report.setStatus("PENDING");

        return reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public Page<Report> getReportsByStatus(String status, Pageable pageable) {
        return reportRepository.findByStatus(status.toUpperCase(), pageable);
    }

    public Report updateReportStatus(UUID reportId, String status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(status.toUpperCase());
        return reportRepository.save(report);
    }
}
