package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.AiService.DTO.AiUsageResponse;
import com.Blog.Platform.AiService.ServiceImpl.AiUsageService;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.DTO.ProfileUpdateRequest;
import com.Blog.Platform.User.DTO.UserProfileResponse;
import com.Blog.Platform.User.Excepction.UserAlreadyExistsException;
import com.Blog.Platform.User.Excepction.UserNotFoundException;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import com.Blog.Platform.User.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;
    private final FileStorageServiceImpl fileStorageService;
    private final AiUsageService aiUsageService;

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepo.findByUsername(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepo.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepo.existsByUsername(username);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return userRepo.findById(id);
    }

    @Override
    public UserProfileResponse updateProfile(ProfileUpdateRequest request) {
        User user = getCurrentUser();

        // Check if email is being changed and if it's already taken
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("Email already registered");
            }
            user.setEmail(request.getEmail());
        }

        // Check if username is being changed and if it's already taken
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (existsByUsername(request.getUsername())) {
                throw new UserAlreadyExistsException("Username already taken");
            }
            user.setUsername(request.getUsername());
        }

        // Update other fields if provided
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getWebsite() != null) {
            user.setWebsite(request.getWebsite());
        }
        if (request.getMobileNumber() != null) {
            user.setMobileNumber(request.getMobileNumber());
        }

        User savedUser = userRepo.save(user);
        return toProfileResponse(savedUser);
    }

    @Override
    public UserProfileResponse updateProfileImage(MultipartFile image) {
        User user = getCurrentUser();

        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        // Delete old image if exists
        if (user.getProfileImageUrl() != null) {
            fileStorageService.deleteImage(user.getProfileImageUrl());
        }

        // Save new image
        String imageUrl = fileStorageService.saveImage(image);
        user.setProfileImageUrl(imageUrl);

        User savedUser = userRepo.save(user);
        return toProfileResponse(savedUser);
    }

    @Override
    public User getCurrentUser() {
        String email = SecurityUtil.getCurrentUserEmail();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private UserProfileResponse toProfileResponse(User user) {
        AiUsageResponse usage = aiUsageService.getTodayUsage();
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getBio(),
                user.getWebsite(),
                user.getMobileNumber(),
                user.getProfileImageUrl(),
                user.getRole().name(),
                user.isEmailVerified(),
                user.isMobileVerified(),
                usage.getUsed(),
                usage.getLimit());
    }
}
