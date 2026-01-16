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
    private String role;
    private boolean emailVerified;
    private boolean mobileVerified;

    private int aiUsedToday;
    private int aiDailyLimit;
}
