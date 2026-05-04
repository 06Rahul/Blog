package com.Blog.Platform.User.DTO;

import jakarta.validation.constraints.Email;

import java.util.UUID;

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

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
