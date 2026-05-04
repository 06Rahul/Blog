package com.Blog.Platform.AiService.Prompt;

public class PromptTemplates {

    public static String enhance(String content) {
        return """
                Improve the writing quality while preserving the original meaning and tone.
                Return ONLY the improved text.
                Do NOT add conversational filler like "Here is an improved version".
                Do NOT use Markdown or HTML tags.

                Content:
                %s
                """.formatted(content);
    }

    public static String grammarFix(String content) {
        return """
                Fix grammar, spelling, and punctuation errors only.
                Return ONLY the fixed text.
                Do NOT rewrite sentences.
                Do NOT add conversational filler.

                Content:
                %s
                """.formatted(content);
    }

    public static String summarize(String content) {
        return """
                Summarize the following content in 3-5 concise lines.
                Return ONLY the summary text.
                Do NOT add conversational filler.

                Content:
                %s
                """.formatted(content);
    }

    public static String titleSuggestions(String content) {
        return """
                Suggest 5 engaging blog titles for the following content.
                Return ONLY the list of 5 titles, one per line.
                Do NOT include numbering (1., 2.) or bullet points.
                Do NOT add conversational filler like "Here are 5 titles".

                Content:
                %s
                """.formatted(content);
    }
}
