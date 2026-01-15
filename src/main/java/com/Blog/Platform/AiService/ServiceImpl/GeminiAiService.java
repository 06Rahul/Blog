package com.Blog.Platform.AiService.ServiceImpl;

import com.Blog.Platform.AiService.Client.GeminiClient;
import com.Blog.Platform.AiService.Model.AiFeature;
import com.Blog.Platform.AiService.Prompt.PromptTemplates;
import com.Blog.Platform.AiService.Service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeminiAiService implements AiService {

    private final GeminiClient geminiClient;
    private final AiUsageService aiUsageService;

    @Override
    public String enhanceWriting(String content) {
        aiUsageService.validateAndIncrement(AiFeature.ENHANCE);
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
}
