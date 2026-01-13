package com.Blog.UserService.UserMapper;


import com.Blog.UserService.DTO.SignUpRequest;
import com.Blog.UserService.Model.Role;
import com.Blog.UserService.Model.User;
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
