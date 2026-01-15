package com.Blog.Platform.User.DTO;

import jakarta.validation.constraints.Email;
import lombok.Data;

import java.util.UUID;

@Data
public class SignInResponse {

    private UUID id;
    private String email;
    private String username;
    private String role;
    private String profileImageUrl;
    private String accessToken;

    public SignInResponse(UUID id,
                          String email,
                          String username,
                          String role,
                          String profileImageUrl,
                          String accessToken) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.role = role;
        this.profileImageUrl = profileImageUrl;
        this.accessToken = accessToken;
    }
}

