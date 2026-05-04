package com.Blog.Platform.User.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SignUpResponse {
    private String username;
    private String email;
    private String message;
    private boolean verificationRequired;
    private LocalDateTime expiresAt;
}
