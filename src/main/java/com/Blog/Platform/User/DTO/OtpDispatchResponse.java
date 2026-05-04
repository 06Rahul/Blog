package com.Blog.Platform.User.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class OtpDispatchResponse {
    private String email;
    private String message;
    private LocalDateTime expiresAt;
}
