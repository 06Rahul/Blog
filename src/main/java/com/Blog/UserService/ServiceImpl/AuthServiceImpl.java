package com.Blog.UserService.ServiceImpl;

import com.Blog.UserService.Config.CustomUserDetailsService;
import com.Blog.UserService.DTO.*;
import com.Blog.UserService.Excepction.InvalidCredentialsException;
import com.Blog.UserService.Excepction.UserAlreadyExistsException;
import com.Blog.UserService.Model.RefreshToken;
import com.Blog.UserService.Model.User;
import com.Blog.UserService.Repo.RefreshTokenRepo;
import com.Blog.UserService.Repo.UserRepo;
import com.Blog.UserService.Service.AuthService;
import com.Blog.UserService.UserMapper.UserMapper;
import com.Blog.UserService.Utils.CookieUtil;
import com.Blog.UserService.Utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final CookieUtil cookieUtil;
    private final RefreshTokenRepo  refreshTokenRepo;
    private final JwtUtil jwtUtil;
    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final CustomUserDetailsService customUserDetailsService;
    private final FileStorageServiceImpl fileStorageService;

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
            user.setProfileImageUrl(fileStorageService.saveImage(image));
        }

        User savedUser = userRepo.save(user);

        return new SignUpResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail()
        );
    }

    @Override
    public SignInResponse login(SignInRequest request, HttpServletResponse response) {

        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepo.save(user);

        var userDetails =
                customUserDetailsService.loadUserByUsername(user.getEmail());

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        // store refresh token in DB (rotation support)
        refreshTokenService.createRefreshToken(user, refreshToken);

        // set refresh token as HttpOnly cookie
        cookieUtil.setRefreshToken(response, refreshToken);


        return new SignInResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole().name(),
                user.getProfileImageUrl(),
                accessToken
        );
    }


    @Override
    public TokenRefreshResponse refreshToken(HttpServletRequest request,
                                             HttpServletResponse response) {

        // 1️⃣ Read refresh token from HttpOnly cookie
        String refreshToken = cookieUtil.getRefreshToken(request);

        // 2️⃣ Verify refresh token (exists, not expired, not reused)
        RefreshToken storedToken =
                refreshTokenService.verifyRefreshToken(refreshToken);

        User user = storedToken.getUser();

        // 3️⃣ 🔥 MARK OLD TOKEN AS USED (reuse detection)
        storedToken.setUsed(true);
        refreshTokenRepo.save(storedToken);

        // 4️⃣ Generate NEW refresh token (rotation)
        String newRefreshToken =
                jwtUtil.generateRefreshToken(
                        customUserDetailsService.loadUserByUsername(user.getEmail())
                );

        refreshTokenService.createRefreshToken(user, newRefreshToken);

        // 5️⃣ Set new refresh token in HttpOnly cookie
        cookieUtil.setRefreshToken(response, newRefreshToken);

        // 6️⃣ Generate new access token
        String newAccessToken =
                jwtUtil.generateAccessToken(
                        customUserDetailsService.loadUserByUsername(user.getEmail())
                );

        return new TokenRefreshResponse(newAccessToken);
    }



    @Override
    public void logout(HttpServletRequest request,
                       HttpServletResponse response) {

        String refreshToken = cookieUtil.getRefreshToken(request);

        refreshTokenService.deleteByToken(refreshToken);
        cookieUtil.clearRefreshToken(response);
    }
}
