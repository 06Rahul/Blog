package com.Blog.Platform.AiService.Service;

public interface AiService {

    String enhanceWriting(String content);

    String fixGrammar(String content);

    String summarize(String content);

    String suggestTitles(String content);

    com.Blog.Platform.AiService.Model.ModerationResult moderateContent(String text);

    java.util.List<String> extractKeywords(String title, String content);

    String generateTeaser(String title, String content);

    String coachWriting(String text, String action);

    String generateCommentReply(String commentText, String postTitle);

    String triageReport(String reason, String itemContent);

    String generateThumbnail(String title, String content);
}
