package com.Blog.Platform.AiService.Controller;

import com.Blog.Platform.AiService.DTO.AiUsageResponse;
import com.Blog.Platform.AiService.ServiceImpl.AiUsageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI utilities for enhancing and generating content.")
public class AiUsageController {

    private final AiUsageService aiUsageService;

    @GetMapping("/usage")
    @Operation(summary = "Get today's AI usage", description = "Returns today's used tokens/credits and the daily limit for the authenticated user.")
    public ResponseEntity<AiUsageResponse> usage() {
        return ResponseEntity.ok(aiUsageService.getTodayUsage());
    }
}

