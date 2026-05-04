package com.Blog.Platform.AiService.Controller;

import com.Blog.Platform.AiService.DTO.AiUsageResponse;
import com.Blog.Platform.AiService.ServiceImpl.AiUsageService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiUsageController {

    private final AiUsageService aiUsageService;

    public AiUsageController(AiUsageService aiUsageService) {
        this.aiUsageService = aiUsageService;
    }

    @GetMapping("/usage")
    @Operation(summary = "Get today's AI usage", description = "Returns today's used tokens/credits and the daily limit for the authenticated user.")
    public ResponseEntity<AiUsageResponse> usage() {
        return ResponseEntity.ok(aiUsageService.getTodayUsage());
    }
}
