package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.DTO.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    SignUpResponse register(SignUpRequest request, MultipartFile image);
    SignInResponse login(SignInRequest request, HttpServletResponse response);
    ApiMessageResponse verifySignupOtp(VerifyOtpRequest request);
    OtpDispatchResponse resendSignupOtp(ResendOtpRequest request);
    OtpDispatchResponse requestPasswordResetOtp(ResendOtpRequest request);
    ApiMessageResponse verifyPasswordResetOtp(VerifyOtpRequest request);
    ApiMessageResponse resetPasswordWithOtp(PasswordResetConfirmRequest request);
    UsernameAvailabilityResponse checkUsernameAvailability(String username);


    TokenRefreshResponse refreshToken(HttpServletRequest request , HttpServletResponse response);
    void logout(HttpServletRequest request, HttpServletResponse response);
}
