package com.Blog.Platform.User.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class UsernameAvailabilityResponse {
    private boolean available;
    private String message;
    private List<String> suggestions;
}
