package com.Blog.Platform.User.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignInRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;
}
