package com.Blog.UserService.Service;

import com.Blog.UserService.DTO.SignInRequest;
import com.Blog.UserService.DTO.SignInResponse;
import com.Blog.UserService.DTO.SignUpRequest;
import com.Blog.UserService.DTO.SignUpResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    SignUpResponse register(SignUpRequest request, MultipartFile image);
    SignInResponse login(SignInRequest request);
}
