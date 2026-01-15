package com.Blog.Platform.Blog.Exception;

import com.Blog.Platform.AiService.Exception.AiLimitExceededException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class BlogGlobalExceptionHandler {

    //Ai Usages limit exceed
    @ExceptionHandler(AiLimitExceededException.class)
    public ResponseEntity<?> handleAiLimit(AiLimitExceededException ex) {
        return ResponseEntity.status(429).body(
                Map.of("error", ex.getMessage())
        );
    }

    /* ===================== 404 ===================== */

    @ExceptionHandler(BlogNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBlogNotFound(
            BlogNotFoundException ex
    ) {
        return new ResponseEntity<>(
                new ErrorResponse(
                        HttpStatus.NOT_FOUND.value(),
                        ex.getMessage(),
                        LocalDateTime.now()
                ),
                HttpStatus.NOT_FOUND
        );
    }

    /* ===================== 403 ===================== */

    @ExceptionHandler(BlogAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            BlogAccessDeniedException ex
    ) {
        return new ResponseEntity<>(
                new ErrorResponse(
                        HttpStatus.FORBIDDEN.value(),
                        ex.getMessage(),
                        LocalDateTime.now()
                ),
                HttpStatus.FORBIDDEN
        );
    }

    /* ===================== 400 ===================== */

    @ExceptionHandler(InvalidBlogStateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidState(
            InvalidBlogStateException ex
    ) {
        return new ResponseEntity<>(
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        ex.getMessage(),
                        LocalDateTime.now()
                ),
                HttpStatus.BAD_REQUEST
        );
    }

    /* ===================== 500 (fallback) ===================== */

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex
    ) {
        return new ResponseEntity<>(
                new ErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Something went wrong",
                        LocalDateTime.now()
                ),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
