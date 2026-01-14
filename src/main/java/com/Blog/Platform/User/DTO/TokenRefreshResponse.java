package com.Blog.Platform.User.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class TokenRefreshResponse {
    private String accessToken;
}
