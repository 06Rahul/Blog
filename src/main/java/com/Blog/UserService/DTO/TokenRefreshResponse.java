package com.Blog.UserService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class TokenRefreshResponse {
    private String accessToken;
}
