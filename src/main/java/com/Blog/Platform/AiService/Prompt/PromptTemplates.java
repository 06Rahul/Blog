package com.Blog.Platform.AiService.Prompt;

public class PromptTemplates {

    public static String enhance(String content) {
        return """
        Improve the writing quality while preserving the original meaning and tone.
        Do not add new ideas.

        Content:
        %s
        """.formatted(content);
    }
    public static String grammarFix(String content) {
        return """
        Fix grammar, spelling, and punctuation errors only.
        Do not rewrite sentences.

        Content:
        %s
        """.formatted(content);
    }
    public static String summarize(String content) {
        return """
        Summarize the following content in 3-5 concise lines.

        Content:
        %s
        """.formatted(content);
    }
    public static String titleSuggestions(String content) {
        return """
        Suggest 5 engaging blog titles for the following content.

        Content:
        %s
        """.formatted(content);
    }
}
