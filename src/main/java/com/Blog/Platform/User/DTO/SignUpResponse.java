package com.Blog.Platform.User.DTO;

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
