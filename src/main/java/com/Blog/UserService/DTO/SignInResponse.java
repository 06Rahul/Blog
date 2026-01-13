package com.Blog.UserService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class SignInResponse {

    private UUID id;
    private String email;
    private String username;
    private String role;
    private String profileImageUrl;
}
