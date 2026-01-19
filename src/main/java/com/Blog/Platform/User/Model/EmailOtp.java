package com.Blog.Platform.User.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_otp")
@Data
public class EmailOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String email;

    private String otpHash;

    private LocalDateTime expiresAt;

    private boolean verified = false;
}

