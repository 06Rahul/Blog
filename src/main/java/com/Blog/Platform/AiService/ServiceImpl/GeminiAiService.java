package com.Blog.Platform.AiService.ServiceImpl;

import com.Blog.Platform.AiService.Client.GeminiClient;
import com.Blog.Platform.AiService.Client.StabilityApiClient;
import com.Blog.Platform.AiService.Model.AiFeature;
import com.Blog.Platform.AiService.Prompt.PromptTemplates;
import com.Blog.Platform.AiService.Service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiAiService implements AiService {

    private final GeminiClient geminiClient;
    private final StabilityApiClient stabilityApiClient;
    private final AiUsageService aiUsageService;

    @Override
    public String enhanceWriting(String content) {
        log.info("inside enhanceWriting method........");
        aiUsageService.validateAndIncrement(AiFeature.ENHANCE);
        log.info(AiFeature.ENHANCE.toString());
        log.info("enhanceWriting end");
        return geminiClient.call(
                PromptTemplates.enhance(content)
        );
    }

    @Override
    public String fixGrammar(String content) {
        aiUsageService.validateAndIncrement(AiFeature.GRAMMAR);
        return geminiClient.call(
                PromptTemplates.grammarFix(content)
        );
    }

    @Override
    public String summarize(String content) {
        aiUsageService.validateAndIncrement(AiFeature.SUMMARY);
        return geminiClient.call(
                PromptTemplates.summarize(content)
        );
    }

    @Override
    public String suggestTitles(String content) {
        aiUsageService.validateAndIncrement(AiFeature.TITLE);
        return geminiClient.call(
                PromptTemplates.titleSuggestions(content)
        );
    }

    public com.Blog.Platform.AiService.Model.ModerationResult moderateContent(String text) {
        try {
            String prompt = "Analyze the following text strictly for: hate speech, harassment, explicit sexual content, or threats of violence.\n" +
                            "Respond with EXACTLY one line in this format:\n  SAFE or UNSAFE:<reason>\n" +
                            "Do not add any other text.\nText to analyze: " + text;
            String response = geminiClient.call(prompt).trim();
            if (response.startsWith("UNSAFE:")) {
                return new com.Blog.Platform.AiService.Model.ModerationResult(false, response.substring(7).trim());
            }
            return new com.Blog.Platform.AiService.Model.ModerationResult(true, null);
        } catch (Exception e) {
            log.warn("Gemini moderation failed, failing open: {}", e.getMessage());
            return new com.Blog.Platform.AiService.Model.ModerationResult(true, null);
        }
    }

    @Override
    public java.util.List<String> extractKeywords(String title, String content) {
        String prompt = "Extract exactly 8-10 keywords from this blog post that best represent its topics.\n" +
                        "Return ONLY a comma-separated list of lowercase keywords. No other text.\n" +
                        "Title: " + title + "\nContent (first 1000 chars): " + 
                        content.substring(0, Math.min(1000, content.length()));
        try {
            String response = geminiClient.call(prompt).trim();
            return java.util.Arrays.stream(response.split(","))
                    .map(String::trim)
                    .filter(k -> !k.isBlank())
                    .limit(10)
                    .toList();
        } catch (Exception e) {
            log.warn("Gemini keyword extraction failed: {}", e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    @Override
    public String generateTeaser(String title, String content) {
        String prompt = "Write exactly one sentence (max 20 words) summarizing this blog post as a teaser. Return only the sentence, no quotes.\nTitle: " + title + "\nContent: " + content.substring(0, Math.min(500, content.length()));
        try { 
            return geminiClient.call(prompt).trim(); 
        } catch (Exception e) { 
            return content.substring(0, Math.min(120, content.length())) + "..."; 
        }
    }

    @Override
    public String coachWriting(String text, String action) {
        aiUsageService.validateAndIncrement(AiFeature.COACH);
        String prompt = "You are an expert writing coach. Please " + action + " the following text, and provide ONLY the revised text without quotes or explanations.\\n" +
                        "Text: " + text;
        return geminiClient.call(prompt);
    }

    @Override
    public String generateCommentReply(String commentText, String postTitle) {
        aiUsageService.validateAndIncrement(AiFeature.COMMENT_REPLY);
        String prompt = "You are the author of a blog post titled '" + postTitle + "'. " +
                        "A reader just left this comment: '" + commentText + "'. " +
                        "Draft a polite, concise (1-3 sentences) suggested reply to engage with them. Return ONLY the reply text.";
        return geminiClient.call(prompt);
    }

    @Override
    public String triageReport(String reason, String itemContent) {
        String prompt = "You are a content moderation AI. A user reported content for this reason: '" + reason + "'. " +
                        "The content is: '" + itemContent.substring(0, Math.min(itemContent.length(), 600)) + "'. " +
                        "Determine the severity of this report as HIGH, MEDIUM, or LOW. " +
                        "HIGH means illegal, severe harassment, explicit content, or immediate danger. " +
                        "MEDIUM means spam, moderate abuse, or aggressive language. " +
                        "LOW means minor disagreement, benign, or likely false report. " +
                        "Return ONLY one word: HIGH, MEDIUM, or LOW.";
        try {
            String res = geminiClient.call(prompt).trim().toUpperCase();
            if (res.contains("HIGH")) return "HIGH";
            if (res.contains("MEDIUM")) return "MEDIUM";
            return "LOW";
        } catch (Exception e) {
            log.warn("Report triage failed: {}", e.getMessage());
            return "LOW";
        }
    }

    @Override
    public String generateThumbnail(String title, String content) {
        aiUsageService.validateAndIncrement(AiFeature.THUMBNAIL);
        String promptInstruction = "Create a vivid, highly descriptive image generation prompt (max 30 words) for a stable diffusion model based on this blog post. " +
                                   "Title: '" + title + "'. Content: '" + content.substring(0, Math.min(content.length(), 400)) + "'. " +
                                   "Return ONLY the image prompt.";
        try {
            String imagePrompt = geminiClient.call(promptInstruction).trim();
            String imageUrl = stabilityApiClient.generateImage(imagePrompt);
            return imageUrl != null ? imageUrl : "https://dummyimage.com/512x512/000/fff&text=Thumbnail+Gen+Failed";
        } catch (Exception e) {
            log.error("Thumbnail pipeline failed: {}", e.getMessage());
            return "https://dummyimage.com/512x512/000/fff&text=Thumbnail+Gen+Error";
        }
    }
}
