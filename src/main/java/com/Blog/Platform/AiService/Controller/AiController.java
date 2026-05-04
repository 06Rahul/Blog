package com.Blog.Platform.AiService.Controller;

import com.Blog.Platform.AiService.DTO.AiRequest;
import com.Blog.Platform.AiService.DTO.AiResponse;
import com.Blog.Platform.AiService.Service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI utilities for enhancing and generating content.")
public class AiController {

    private final AiService aiService;

    /* ===================== ENHANCE ===================== */
    @PostMapping("/enhance")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Enhance writing", description = "Improves the given text (style/clarity) using the configured AI provider.")
    public ResponseEntity<AiResponse> enhance(
            @RequestBody AiRequest request
    ) {
        return ResponseEntity.ok(
                new AiResponse(
                        aiService.enhanceWriting(request.getContent())
                )
        );
    }

    /* ===================== GRAMMAR FIX ===================== */
    @PostMapping("/grammar")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Fix grammar", description = "Corrects grammar and spelling of the given text using the configured AI provider.")
    public ResponseEntity<AiResponse> fixGrammar(
            @RequestBody AiRequest request
    ) {
        return ResponseEntity.ok(
                new AiResponse(
                        aiService.fixGrammar(request.getContent())
                )
        );
    }

    /* ===================== SUMMARIZE ===================== */
    @PostMapping("/summarize")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Summarize text", description = "Generates a concise summary of the given text using the configured AI provider.")
    public ResponseEntity<AiResponse> summarize(
            @RequestBody AiRequest request
    ) {
        return ResponseEntity.ok(
                new AiResponse(
                        aiService.summarize(request.getContent())
                )
        );
    }

    /* ===================== TITLE SUGGESTIONS ===================== */
    @PostMapping("/titles")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Suggest titles", description = "Suggests possible titles for the given content using the configured AI provider.")
    public ResponseEntity<AiResponse> suggestTitles(
            @RequestBody AiRequest request
    ) {
        return ResponseEntity.ok(
                new AiResponse(
                        aiService.suggestTitles(request.getContent())
                )
        );
    }
}
