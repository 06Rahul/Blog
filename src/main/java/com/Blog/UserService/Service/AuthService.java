package com.Blog.UserService.Service;

import com.Blog.UserService.DTO.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    SignUpResponse register(SignUpRequest request, MultipartFile image);
    SignInResponse login(SignInRequest request, HttpServletResponse response);


    TokenRefreshResponse refreshToken(HttpServletRequest request , HttpServletResponse response);
    void logout(HttpServletRequest request, HttpServletResponse response);
}
