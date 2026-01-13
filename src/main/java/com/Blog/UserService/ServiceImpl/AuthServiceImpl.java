package com.Blog.UserService.ServiceImpl;

import com.Blog.UserService.DTO.SignInRequest;
import com.Blog.UserService.DTO.SignInResponse;
import com.Blog.UserService.DTO.SignUpRequest;
import com.Blog.UserService.DTO.SignUpResponse;
import com.Blog.UserService.Excepction.InvalidCredentialsException;
import com.Blog.UserService.Excepction.UserAlreadyExistsException;
import com.Blog.UserService.Model.User;
import com.Blog.UserService.Repo.UserRepo;
import com.Blog.UserService.Service.AuthService;
import com.Blog.UserService.UserMapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor  @Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageServiceImpl  fileStorageService;

    @Override
    public SignUpResponse register(SignUpRequest request, MultipartFile image) {
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered");
        }
        if (userRepo.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already taken");
        }
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.saveImage(image);
            user.setProfileImageUrl(imagePath);
        }
        User savedUser = userRepo.save(user);
        return new SignUpResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail()
        );
    }

    @Override
    public SignInResponse login(SignInRequest request) {

        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid email or password")
                );

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepo.save(user);

        return new SignInResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole().name(),
                user.getProfileImageUrl()
        );
    }

}
