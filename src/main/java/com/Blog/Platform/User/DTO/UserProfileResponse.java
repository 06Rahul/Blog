package com.Blog.Platform.User.DTO;

import java.util.UUID;

public class UserProfileResponse {
    private UUID id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String bio;
    private String website;
    private String mobileNumber;
    private String profileImageUrl;
    private String role;
    private boolean emailVerified;
    private boolean mobileVerified;

    private int aiUsedToday;
    private int aiDailyLimit;

    public UserProfileResponse() {
    }

    public UserProfileResponse(UUID id, String email, String username, String firstName, String lastName, String bio,
            String website, String mobileNumber, String profileImageUrl, String role, boolean emailVerified,
            boolean mobileVerified, int aiUsedToday, int aiDailyLimit) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.bio = bio;
        this.website = website;
        this.mobileNumber = mobileNumber;
        this.profileImageUrl = profileImageUrl;
        this.role = role;
        this.emailVerified = emailVerified;
        this.mobileVerified = mobileVerified;
        this.aiUsedToday = aiUsedToday;
        this.aiDailyLimit = aiDailyLimit;
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

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isMobileVerified() {
        return mobileVerified;
    }

    public void setMobileVerified(boolean mobileVerified) {
        this.mobileVerified = mobileVerified;
    }

    public int getAiUsedToday() {
        return aiUsedToday;
    }

    public void setAiUsedToday(int aiUsedToday) {
        this.aiUsedToday = aiUsedToday;
    }

    public int getAiDailyLimit() {
        return aiDailyLimit;
    }

    public void setAiDailyLimit(int aiDailyLimit) {
        this.aiDailyLimit = aiDailyLimit;
    }
}
