package com.Blog.Platform.AiService.Exception;

public class AiLimitExceededException extends RuntimeException {
    public AiLimitExceededException(String message) {
        super(message);
    }
}