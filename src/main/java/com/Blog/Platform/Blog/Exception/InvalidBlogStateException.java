package com.Blog.Platform.Blog.Exception;

public class InvalidBlogStateException extends RuntimeException {
    public InvalidBlogStateException(String message) {
        super(message);
    }
}
