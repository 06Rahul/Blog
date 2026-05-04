package com.Blog.Platform.User.Controller;

import com.Blog.Platform.User.Service.AuthService;
import com.Blog.Platform.User.DTO.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication and token lifecycle endpoints.")
public class UserController {
    private final AuthService authService;

    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Sign up",
            description = "Registers a new user. Send the JSON payload in multipart field `data` and optionally an `image` file."
    )
    public ResponseEntity<SignUpResponse> register(
            @Parameter(description = "Sign up JSON (SignUpRequest) serialized as string in multipart field `data`.", required = true)
            @RequestPart("data") String data,
            @Parameter(description = "Optional profile image.", required = false)
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        SignUpRequest request = mapper.readValue(data, SignUpRequest.class);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request, image));
    }



    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates user credentials and returns access token details. May also set refresh token cookie depending on implementation.")
    public ResponseEntity<SignInResponse> login(
            @Valid @RequestBody SignInRequest request,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.login(request, response));
    }


    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Logs the current user out and clears auth/refresh tokens if applicable.")
    public ResponseEntity<Void> logout(HttpServletRequest request,
                                       HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Issues a new access token using the refresh token (typically from cookie).")
    public ResponseEntity<TokenRefreshResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.refreshToken(request, response));
    }



}
