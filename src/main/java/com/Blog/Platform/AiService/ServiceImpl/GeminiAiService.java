package com.Blog.Platform.AiService.ServiceImpl;


import com.Blog.Platform.AiService.Client.GeminiClient;
import com.Blog.Platform.AiService.Prompt.PromptTemplates;
import com.Blog.Platform.AiService.Service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeminiAiService implements AiService {

    private final GeminiClient geminiClient;

    @Override
    public String enhanceWriting(String content) {
        String prompt = PromptTemplates.enhance(content);
        return geminiClient.call(prompt);
    }

    @Override
    public String fixGrammar(String content) {
        String prompt = PromptTemplates.grammarFix(content);
        return geminiClient.call(prompt);
    }

    @Override
    public String summarize(String content) {
        String prompt = PromptTemplates.summarize(content);
        return geminiClient.call(prompt);
    }

    @Override
    public String suggestTitles(String content) {
        String prompt = PromptTemplates.titleSuggestions(content);
        return geminiClient.call(prompt);
    }
}
