package com.Blog.Platform.Blog.Exception;

public class ResourceNotFoundException extends BlogNotFoundException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
