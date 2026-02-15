package com.Blog.Platform.User.UserMapper;

import com.Blog.Platform.User.DTO.SignUpRequest;
import com.Blog.Platform.User.Model.Role;
import com.Blog.Platform.User.Model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(SignUpRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setBio(request.getBio());
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setWebsite(request.getWebsite());
        user.setMobileNumber(request.getMobileNumber());
        user.setRole(Role.USER);
        return user;
    }

    public com.Blog.Platform.User.DTO.UserProfileResponse toUserProfileResponse(User user) {
        return new com.Blog.Platform.User.DTO.UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getActualUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getBio(),
                user.getWebsite(),
                user.getMobileNumber(),
                sanitizeImageUrl(user.getProfileImageUrl()),
                user.getRole().name(),
                user.isEmailVerified(),
                user.isMobileVerified(),
                0, // AI Usage not relevant for public profile
                0);
    }

    public String sanitizeImageUrl(String url) {
        if (url == null || url.isEmpty())
            return null;
        if (url.contains("user-images")) {
            // Handle both \ and /
            int lastBackslash = url.lastIndexOf("\\");
            int lastSlash = url.lastIndexOf("/");
            int index = Math.max(lastBackslash, lastSlash);
            String fileName = index >= 0 ? url.substring(index + 1) : url;
            return "/api/images/" + fileName;
        }
        if (url.startsWith("./") || url.startsWith("user-images")) {
            int lastSlash = url.lastIndexOf("/");
            String fileName = lastSlash >= 0 ? url.substring(lastSlash + 1) : url;
            return "/api/images/" + fileName;
        }
        return url;
    }
}
