package com.Blog.Platform.User.Model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pending_user_registration")

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getTempProfileImagePath() {
        return tempProfileImagePath;
    }

    public void setTempProfileImagePath(String tempProfileImagePath) {
        this.tempProfileImagePath = tempProfileImagePath;
    }

    public int getOtpRequestCount() {
        return otpRequestCount;
    }

    public void setOtpRequestCount(int otpRequestCount) {
        this.otpRequestCount = otpRequestCount;
    }

    public LocalDateTime getLastOtpRequestAt() {
        return lastOtpRequestAt;
    }

    public void setLastOtpRequestAt(LocalDateTime lastOtpRequestAt) {
        this.lastOtpRequestAt = lastOtpRequestAt;
    }
}
