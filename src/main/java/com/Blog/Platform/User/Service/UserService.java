package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.DTO.ProfileUpdateRequest;
import com.Blog.Platform.User.DTO.UserProfileResponse;
import com.Blog.Platform.User.Model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

public interface UserService {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<User> findById(UUID id);

    UserProfileResponse updateProfile(ProfileUpdateRequest request);

    UserProfileResponse updateProfileImage(MultipartFile image);

    User getCurrentUser();
}
