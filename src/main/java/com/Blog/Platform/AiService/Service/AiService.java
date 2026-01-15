package com.Blog.Platform.AiService.Service;

public interface AiService {

    String enhanceWriting(String content);

    String fixGrammar(String content);

    String summarize(String content);

    String suggestTitles(String content);
}
