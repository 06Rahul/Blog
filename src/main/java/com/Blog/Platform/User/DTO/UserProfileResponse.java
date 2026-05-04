package com.Blog.Platform.User.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
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
    private String bannerImageUrl;
    private String contactInfo;
    private String interests;
    private String role;
    private boolean emailVerified;
    private boolean mobileVerified;

    private int aiUsedToday;
    private int aiDailyLimit;
    private long followerCount;
    private long followingCount;
    private long postCount;
    private long draftCount;
    private long savedCount;
    private long joinedCount;
    private long createdCount;
}
