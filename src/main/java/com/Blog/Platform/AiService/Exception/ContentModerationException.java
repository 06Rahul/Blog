package com.Blog.Platform.AiService.Exception;

public class ContentModerationException extends RuntimeException {
    public ContentModerationException(String reason) {
        super("Content was flagged: " + reason);
    }
}
