package com.Blog.Platform.AiService.Controller;

import com.Blog.Platform.AiService.DTO.AiRequest;
import com.Blog.Platform.AiService.DTO.AiResponse;
import com.Blog.Platform.AiService.Service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

        private final AiService aiService;

        public AiController(AiService aiService) {
                this.aiService = aiService;
        }

        /* ===================== ENHANCE ===================== */
        @PostMapping("/enhance")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<AiResponse> enhance(@RequestBody AiRequest request) {
                try {
                        return ResponseEntity.ok(new AiResponse(aiService.enhanceWriting(request.getContent())));
                } catch (Exception e) {
                        return handleException(e);
                }
        }

        /* ===================== GRAMMAR FIX ===================== */
        @PostMapping("/grammar")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<AiResponse> fixGrammar(@RequestBody AiRequest request) {
                try {
                        return ResponseEntity.ok(new AiResponse(aiService.fixGrammar(request.getContent())));
                } catch (Exception e) {
                        return handleException(e);
                }
        }

        /* ===================== SUMMARIZE ===================== */
        @PostMapping("/summarize")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<AiResponse> summarize(@RequestBody AiRequest request) {
                try {
                        return ResponseEntity.ok(new AiResponse(aiService.summarize(request.getContent())));
                } catch (Exception e) {
                        return handleException(e);
                }
        }

        /* ===================== TITLE SUGGESTIONS ===================== */
        @PostMapping("/titles")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<AiResponse> suggestTitles(@RequestBody AiRequest request) {
                try {
                        return ResponseEntity.ok(new AiResponse(aiService.suggestTitles(request.getContent())));
                } catch (Exception e) {
                        return handleException(e);
                }
        }

        private ResponseEntity<AiResponse> handleException(Exception e) {
                if (e.getMessage().contains("503") || e.getMessage().contains("overloaded")) {
                        return ResponseEntity.status(503).body(new AiResponse(
                                        "AI Service is currently overloaded. Please try again in a few moments."));
                }
                return ResponseEntity.status(500).body(new AiResponse("AI Service Error: " + e.getMessage()));
        }
}
