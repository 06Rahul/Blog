package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.DTO.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    // SignUpResponse register(SignUpRequest request, MultipartFile image);
    // SignInResponse login(SignInRequest request, HttpServletResponse response);
    //
    // SignUpResponse passwordReset(PasswordResetRequest request);
    //
    //
    // TokenRefreshResponse refreshToken(HttpServletRequest request ,
    // HttpServletResponse response);
    // void logout(HttpServletRequest request, HttpServletResponse response);

    void register(SignUpRequest request, MultipartFile image);

    SignUpResponse verifyOtp(VerifyOtpRequest request);

    SignInResponse login(SignInRequest request, HttpServletResponse response);

    SignUpResponse passwordReset(PasswordResetRequest request);

    TokenRefreshResponse refreshToken(HttpServletRequest request, HttpServletResponse response);

    void logout(HttpServletRequest request, HttpServletResponse response);

    void resendOtp(String email);
}
