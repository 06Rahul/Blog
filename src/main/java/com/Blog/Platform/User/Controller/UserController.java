package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.Service.AuthService;
import com.Blog.Platform.User.DTO.*;
import com.Blog.Platform.User.Excepction.UserAlreadyExistsException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final AuthService authService;
    private final Validator validator;

    public UserController(AuthService authService, Validator validator) {
        this.authService = authService;
        this.validator = validator;
    }

    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiMessageResponse> signup(
            @RequestPart("data") String data,
            @RequestPart(value = "image", required = false) MultipartFile image) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        SignUpRequest request = mapper.readValue(data, SignUpRequest.class);

        Set<ConstraintViolation<SignUpRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.joining(", "));
            throw new IllegalArgumentException("Validation failed: " + errorMessage);
        }

        authService.register(request, image);

        return ResponseEntity.ok(
                new ApiMessageResponse("OTP sent to your email. Please verify."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<SignUpResponse> verifyOtp(
            @RequestBody VerifyOtpRequest request) {
        SignUpResponse response = authService.verifyOtp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiMessageResponse> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request.getEmail());
        return ResponseEntity.ok(
                new ApiMessageResponse("New OTP sent to your email. Please verify."));
    }

    @PostMapping("/login")
    public ResponseEntity<SignInResponse> login(
            @Valid @RequestBody SignInRequest request,
            HttpServletResponse response) {
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
            HttpServletResponse response) {
        return ResponseEntity.ok(authService.refreshToken(request, response));
    }

    @PostMapping("/reset")
    public ResponseEntity<SignUpResponse> resetPassword(@RequestBody @Valid PasswordResetRequest request) {
        return ResponseEntity.ok(authService.passwordReset(request));

    }

}
