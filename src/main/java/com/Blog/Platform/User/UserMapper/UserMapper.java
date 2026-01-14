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
}
