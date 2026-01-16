package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.Service.AuthService;
import com.Blog.Platform.User.DTO.*;
import com.Blog.Platform.User.Excepction.UserAlreadyExistsException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
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
        
        // Validate the request using Validator
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
