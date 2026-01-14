package com.Blog.Platform.Blog.Exception;

public class BlogAccessDeniedException extends RuntimeException {
    public BlogAccessDeniedException(String message) {
        super(message);
    }
}
