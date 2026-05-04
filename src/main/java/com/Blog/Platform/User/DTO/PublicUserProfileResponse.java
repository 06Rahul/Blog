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

    public PublicUserProfileResponse() {
    }

    public PublicUserProfileResponse(UUID id, String username, String firstName, String lastName, String bio,
            String profileImageUrl, String website, String role) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.bio = bio;
        this.profileImageUrl = profileImageUrl;
        this.website = website;
        this.role = role;
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

        public PublicUserProfileResponse build() {
            return new PublicUserProfileResponse(id, username, firstName, lastName, bio, profileImageUrl, website,
                    role);
        }
    }
}
