package com.Blog.Platform.User.DTO;

import java.util.UUID;

public class PublicUserProfileResponse {
    private UUID id;
    private String username;
    private String firstName;
    private String lastName;
    private String bio;
    private String profileImageUrl;
    private String website;
    private String role;
    
    // New fields
    private String bannerImageUrl;
    private String contactInfo;
    private String interests;
    private java.time.LocalDateTime createdAt;
    
    // Stats
    private long followerCount;
    private long followingCount;
    private long postCount;
    private long communityCount;
    
    // Auth context states
    private boolean isFollowedByCurrentUser;
    private boolean isFollowingCurrentUser;

    public PublicUserProfileResponse() {
    }

    public PublicUserProfileResponse(UUID id, String username, String firstName, String lastName, String bio,
            String profileImageUrl, String website, String role, String bannerImageUrl, String contactInfo, 
            String interests, java.time.LocalDateTime createdAt, long followerCount, long followingCount, 
            long postCount, long communityCount, boolean isFollowedByCurrentUser, boolean isFollowingCurrentUser) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.bio = bio;
        this.profileImageUrl = profileImageUrl;
        this.website = website;
        this.role = role;
        this.bannerImageUrl = bannerImageUrl;
        this.contactInfo = contactInfo;
        this.interests = interests;
        this.createdAt = createdAt;
        this.followerCount = followerCount;
        this.followingCount = followingCount;
        this.postCount = postCount;
        this.communityCount = communityCount;
        this.isFollowedByCurrentUser = isFollowedByCurrentUser;
        this.isFollowingCurrentUser = isFollowingCurrentUser;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getBannerImageUrl() { return bannerImageUrl; }
    public void setBannerImageUrl(String bannerImageUrl) { this.bannerImageUrl = bannerImageUrl; }

    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }

    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    public long getFollowerCount() { return followerCount; }
    public void setFollowerCount(long followerCount) { this.followerCount = followerCount; }

    public long getFollowingCount() { return followingCount; }
    public void setFollowingCount(long followingCount) { this.followingCount = followingCount; }

    public long getPostCount() { return postCount; }
    public void setPostCount(long postCount) { this.postCount = postCount; }

    public long getCommunityCount() { return communityCount; }
    public void setCommunityCount(long communityCount) { this.communityCount = communityCount; }

    public boolean isFollowedByCurrentUser() { return isFollowedByCurrentUser; }
    public void setFollowedByCurrentUser(boolean isFollowedByCurrentUser) { this.isFollowedByCurrentUser = isFollowedByCurrentUser; }

    public boolean isFollowingCurrentUser() { return isFollowingCurrentUser; }
    public void setFollowingCurrentUser(boolean isFollowingCurrentUser) { this.isFollowingCurrentUser = isFollowingCurrentUser; }

    public static PublicUserProfileResponseBuilder builder() {
        return new PublicUserProfileResponseBuilder();
    }

    public static class PublicUserProfileResponseBuilder {
        private UUID id;
        private String username;
        private String firstName;
        private String lastName;
        private String bio;
        private String profileImageUrl;
        private String website;
        private String role;
        private String bannerImageUrl;
        private String contactInfo;
        private String interests;
        private java.time.LocalDateTime createdAt;
        private long followerCount;
        private long followingCount;
        private long postCount;
        private long communityCount;
        private boolean isFollowedByCurrentUser;
        private boolean isFollowingCurrentUser;

        PublicUserProfileResponseBuilder() {
        }

        public PublicUserProfileResponseBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public PublicUserProfileResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public PublicUserProfileResponseBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public PublicUserProfileResponseBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public PublicUserProfileResponseBuilder bio(String bio) {
            this.bio = bio;
            return this;
        }

        public PublicUserProfileResponseBuilder profileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
            return this;
        }

        public PublicUserProfileResponseBuilder website(String website) {
            this.website = website;
            return this;
        }

        public PublicUserProfileResponseBuilder role(String role) {
            this.role = role;
            return this;
        }

        public PublicUserProfileResponseBuilder bannerImageUrl(String bannerImageUrl) {
            this.bannerImageUrl = bannerImageUrl;
            return this;
        }

        public PublicUserProfileResponseBuilder contactInfo(String contactInfo) {
            this.contactInfo = contactInfo;
            return this;
        }

        public PublicUserProfileResponseBuilder interests(String interests) {
            this.interests = interests;
            return this;
        }

        public PublicUserProfileResponseBuilder createdAt(java.time.LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PublicUserProfileResponseBuilder followerCount(long followerCount) {
            this.followerCount = followerCount;
            return this;
        }

        public PublicUserProfileResponseBuilder followingCount(long followingCount) {
            this.followingCount = followingCount;
            return this;
        }

        public PublicUserProfileResponseBuilder postCount(long postCount) {
            this.postCount = postCount;
            return this;
        }

        public PublicUserProfileResponseBuilder communityCount(long communityCount) {
            this.communityCount = communityCount;
            return this;
        }

        public PublicUserProfileResponseBuilder isFollowedByCurrentUser(boolean isFollowedByCurrentUser) {
            this.isFollowedByCurrentUser = isFollowedByCurrentUser;
            return this;
        }

        public PublicUserProfileResponseBuilder isFollowingCurrentUser(boolean isFollowingCurrentUser) {
            this.isFollowingCurrentUser = isFollowingCurrentUser;
            return this;
        }

        public PublicUserProfileResponse build() {
            return new PublicUserProfileResponse(id, username, firstName, lastName, bio, profileImageUrl, website,
                    role, bannerImageUrl, contactInfo, interests, createdAt, followerCount, followingCount, postCount, communityCount, isFollowedByCurrentUser, isFollowingCurrentUser);
        }
    }
}
