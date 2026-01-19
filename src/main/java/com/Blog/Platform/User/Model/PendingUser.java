package com.Blog.Platform.User.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pending_user_registration")
@Data
public class PendingUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String email;
    private String username;
    private String password; // already encoded
    private String firstName;
    private String lastName;

    private String otpHash;
    private LocalDateTime expiresAt;

    // Profile image handling
    private String tempProfileImagePath;

    // OTP resend rate limiting
    private int otpRequestCount = 0;
    private LocalDateTime lastOtpRequestAt;
}
