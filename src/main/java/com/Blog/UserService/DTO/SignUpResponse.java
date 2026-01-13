package com.Blog.UserService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class SignUpResponse {

    private UUID userId;
    private String username;
    private String email;
}
