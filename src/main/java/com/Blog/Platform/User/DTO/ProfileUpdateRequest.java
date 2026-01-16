package com.Blog.Platform.User.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateRequest {

    @Email
    @Size(max = 150)
    private String email;

    @Size(min = 3, max = 50)
    private String username;

    @Size(min = 2, max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 500)
    private String bio;

    private String website;

    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid Indian mobile number"
    )
    private String mobileNumber;
}
