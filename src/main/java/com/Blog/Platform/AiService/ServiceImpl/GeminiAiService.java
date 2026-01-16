package com.Blog.Platform.AiService.ServiceImpl;

import com.Blog.Platform.AiService.Client.GeminiClient;
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
    private final AiUsageService aiUsageService;

    @Override
public String enhanceWriting(String content) {
    try {
        aiUsageService.validateAndIncrement(AiFeature.ENHANCE);
        return geminiClient.call(
                PromptTemplates.enhance(content)
        );
    } catch (RuntimeException ex) {
        log.error("Gemini failed, skipping AI", ex);
        throw ex; 
    }
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
}
