package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.DTO.ApiMessageResponse;
import com.Blog.Platform.User.DTO.OtpDispatchResponse;
import com.Blog.Platform.User.DTO.PasswordResetConfirmRequest;
import com.Blog.Platform.User.DTO.ResendOtpRequest;
import com.Blog.Platform.User.DTO.SignInRequest;
import com.Blog.Platform.User.DTO.SignInResponse;
import com.Blog.Platform.User.DTO.SignUpRequest;
import com.Blog.Platform.User.DTO.SignUpResponse;
import com.Blog.Platform.User.DTO.TokenRefreshResponse;
import com.Blog.Platform.User.DTO.VerifyOtpRequest;
import com.Blog.Platform.User.Service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final AuthService authService;
    private final Validator validator;

    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SignUpResponse> register(
            @RequestPart("data") String data,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        SignUpRequest request = mapper.readValue(data, SignUpRequest.class);

        Set<jakarta.validation.ConstraintViolation<SignUpRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.joining(", "));
            throw new IllegalArgumentException("Validation failed: " + errorMessage);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request, image));
    }

    @PostMapping(value = "/signup", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SignUpResponse> registerJson(
            @Valid @RequestBody SignUpRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request, null));
    }

    @PostMapping("/signup/verify-otp")
    public ResponseEntity<ApiMessageResponse> verifySignupOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        return ResponseEntity.ok(authService.verifySignupOtp(request));
    }

    @PostMapping("/signup/resend-otp")
    public ResponseEntity<OtpDispatchResponse> resendSignupOtp(
            @Valid @RequestBody ResendOtpRequest request
    ) {
        return ResponseEntity.ok(authService.resendSignupOtp(request));
    }

    @PostMapping("/password-reset/request-otp")
    public ResponseEntity<OtpDispatchResponse> requestPasswordResetOtp(
            @Valid @RequestBody ResendOtpRequest request
    ) {
        return ResponseEntity.ok(authService.requestPasswordResetOtp(request));
    }

    @PostMapping("/password-reset/verify-otp")
    public ResponseEntity<ApiMessageResponse> verifyPasswordResetOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        return ResponseEntity.ok(authService.verifyPasswordResetOtp(request));
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<ApiMessageResponse> resetPassword(
            @Valid @RequestBody PasswordResetConfirmRequest request
    ) {
        return ResponseEntity.ok(authService.resetPasswordWithOtp(request));
    }

    @PostMapping("/login")
    public ResponseEntity<SignInResponse> login(
            @Valid @RequestBody SignInRequest request,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request,
                                       HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.refreshToken(request, response));
    }
}
