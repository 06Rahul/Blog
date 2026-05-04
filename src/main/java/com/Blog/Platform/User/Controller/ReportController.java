package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.Model.Report;
import com.Blog.Platform.User.Service.ReportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','AUTHOR','ADMIN')")
    public ResponseEntity<Report> submitReport(@RequestBody ReportRequest request) {
        return ResponseEntity.ok(reportService.submitReport(
                request.getReportedItemId(),
                request.getItemType(),
                request.getReason()
        ));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Report>> getReportsByStatus(
            @RequestParam(defaultValue = "PENDING") String status,
            Pageable pageable) {
        return ResponseEntity.ok(reportService.getReportsByStatus(status, pageable));
    }

    @PatchMapping("/{reportId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Report> updateReportStatus(
            @PathVariable UUID reportId,
            @RequestParam String status) {
        return ResponseEntity.ok(reportService.updateReportStatus(reportId, status));
    }

    @Data
    public static class ReportRequest {
        private UUID reportedItemId;
        private String itemType;
        private String reason;
    }
}
