package com.Blog.UserService.Controller;

import com.Blog.UserService.DTO.SignInRequest;
import com.Blog.UserService.DTO.SignInResponse;
import com.Blog.UserService.DTO.SignUpRequest;
import com.Blog.UserService.DTO.SignUpResponse;
import com.Blog.UserService.Service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final AuthService authService;

    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SignUpResponse> register(
            @RequestPart("data") String data,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        SignUpRequest request = mapper.readValue(data, SignUpRequest.class);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request, image));
    }



    @PostMapping("/login")
    public ResponseEntity<SignInResponse> login(
            @Valid @RequestBody SignInRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

}
