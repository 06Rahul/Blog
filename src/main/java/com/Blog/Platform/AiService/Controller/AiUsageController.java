package com.Blog.Platform.AiService.Controller;

import com.Blog.Platform.AiService.DTO.AiUsageResponse;
import com.Blog.Platform.AiService.ServiceImpl.AiUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiUsageController {

    private final AiUsageService aiUsageService;

    @GetMapping("/usage")
    public ResponseEntity<AiUsageResponse> usage() {
        return ResponseEntity.ok(aiUsageService.getTodayUsage());
    }
}

