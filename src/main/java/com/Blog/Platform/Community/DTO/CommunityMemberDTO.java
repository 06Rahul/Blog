package com.Blog.Platform.Community.DTO;

import com.Blog.Platform.Community.Model.CommunityRole;

import java.time.LocalDateTime;
import java.util.UUID;

public class CommunityMemberDTO {
    private UUID userId;
    private String username;
    private String profileImageUrl;
    private CommunityRole role;
    private com.Blog.Platform.Community.Model.CommunityMemberStatus status;
    private LocalDateTime joinedAt;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public CommunityRole getRole() {
        return role;
    }

    public void setRole(CommunityRole role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public com.Blog.Platform.Community.Model.CommunityMemberStatus getStatus() {
        return status;
    }

    public void setStatus(com.Blog.Platform.Community.Model.CommunityMemberStatus status) {
        this.status = status;
    }
}
