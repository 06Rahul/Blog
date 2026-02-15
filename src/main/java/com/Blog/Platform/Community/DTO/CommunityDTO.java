package com.Blog.Platform.Community.DTO;

import com.Blog.Platform.Community.Model.CommunityRole;
import com.Blog.Platform.Community.Model.CommunityStatus;
import com.Blog.Platform.Community.Model.CommunityVisibility;

import java.time.LocalDateTime;
import java.util.UUID;

public class CommunityDTO {

    private UUID id;
    private String name;
    private String description;
    private String categoryName;
    private UUID ownerId;
    private String ownerName;
    private CommunityVisibility visibility;
    private CommunityStatus status;
    private String rules;
    private long memberCount;
    private CommunityRole myRole; // The requesting user's role, null if not member
    private LocalDateTime createdAt;

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public CommunityVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(CommunityVisibility visibility) {
        this.visibility = visibility;
    }

    public CommunityStatus getStatus() {
        return status;
    }

    public void setStatus(CommunityStatus status) {
        this.status = status;
    }

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public long getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(long memberCount) {
        this.memberCount = memberCount;
    }

    public CommunityRole getMyRole() {
        return myRole;
    }

    public void setMyRole(CommunityRole myRole) {
        this.myRole = myRole;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
