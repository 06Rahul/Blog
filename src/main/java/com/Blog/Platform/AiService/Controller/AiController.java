package com.Blog.Platform.AiService.Controller;

import com.Blog.Platform.AiService.DTO.AiRequest;
import com.Blog.Platform.AiService.DTO.AiResponse;
import com.Blog.Platform.AiService.Service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    /* ===================== ENHANCE ===================== */
    @PostMapping("/enhance")
    @PreAuthorize("isAuthenticated()")
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
