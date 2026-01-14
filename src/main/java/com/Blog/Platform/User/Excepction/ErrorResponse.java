package com.Blog.Platform.User.Excepction;

import java.time.LocalDateTime;

public class ErrorResponse {

    private int statusCode;
    private String message;
    private LocalDateTime timestamp;

    public ErrorResponse(int statusCode, String message, LocalDateTime timestamp) {
        this.statusCode = statusCode;
        this.message = message;
        this.timestamp = timestamp;
    }
}
