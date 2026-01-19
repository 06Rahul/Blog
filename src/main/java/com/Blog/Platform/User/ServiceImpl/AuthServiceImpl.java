package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.User.Config.CustomUserDetailsService;
import com.Blog.Platform.User.Excepction.InvalidCredentialsException;
import com.Blog.Platform.User.Excepction.UserAlreadyExistsException;
import com.Blog.Platform.User.Excepction.UserNotFoundException;
import com.Blog.Platform.User.Model.*;
import com.Blog.Platform.User.Repo.EmailOtpRepo;
import com.Blog.Platform.User.Repo.PendingUserRepo;
import com.Blog.Platform.User.Repo.RefreshTokenRepo;
import com.Blog.Platform.User.Repo.UserRepo;
import com.Blog.Platform.User.Service.AuthService;
import com.Blog.Platform.User.DTO.*;
import com.Blog.Platform.User.UserMapper.UserMapper;
import com.Blog.Platform.User.Utils.*;
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

    private final EmailOtpRepo emailOtpRepo;
    private final PendingUserRepo pendingUserRepo;

    private final CookieUtil cookieUtil;
    private final RefreshTokenRepo refreshTokenRepo;
    private final JwtUtil jwtUtil;
    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final CustomUserDetailsService customUserDetailsService;
    private final FileStorageServiceImpl fileStorageService;
    private final EmailServiceImpl emailService;

    // @Override
    // public SignUpResponse register(SignUpRequest request, MultipartFile image) {
    //
    // if (userRepo.existsByEmail(request.getEmail())) {
    // throw new UserAlreadyExistsException("Email already registered");
    // }
    // if (userRepo.existsByUsername(request.getUsername())) {
    // throw new UserAlreadyExistsException("Username already taken");
    // }
    //
    // User user = userMapper.toEntity(request);
    // user.setPassword(passwordEncoder.encode(request.getPassword()));
    //
    // if (image != null && !image.isEmpty()) {
    // user.setProfileImageUrl(fileStorageService.saveImage(image));
    // }
    //
    // User savedUser = userRepo.save(user);
    // emailService.sendEmail(
    // savedUser.getEmail(),
    // "Welcome to Blog Platform 🎉",
    // EmailTemplateUtil.welcomeEmail(savedUser.getUsername())
    // );
    // log.info(emailService.toString());
    // return new SignUpResponse(
    // savedUser.getId(),
    // savedUser.getActualUsername(),
    // savedUser.getEmail()
    // );
    // }

    @Override
    public void register(SignUpRequest request, MultipartFile image) {

        if (userRepo.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered");
        }
        if (userRepo.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already taken");
        }

        String otp = OTPGenerator.generateOtp();
        log.info("Generated OTP for {}: {}", request.getEmail(), otp);

        PendingUser pendingUser = new PendingUser();
        pendingUser.setEmail(request.getEmail());
        pendingUser.setUsername(request.getUsername());
        pendingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        pendingUser.setFirstName(request.getFirstName());
        pendingUser.setLastName(request.getLastName());
        pendingUser.setOtpHash(OtpHasUtil.hash(otp));
        pendingUser.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        pendingUser.setOtpRequestCount(1);
        pendingUser.setLastOtpRequestAt(LocalDateTime.now());

        // Save profile image to temporary location
        if (image != null && !image.isEmpty()) {
            String tempImagePath = fileStorageService.saveTempImage(image);
            pendingUser.setTempProfileImagePath(tempImagePath);
        }

        pendingUserRepo.save(pendingUser);

        emailService.sendEmail(
                request.getEmail(),
                "Verify your email - Blog Platform 🔐",
                EmailTemplateUtil.otpEmail(request.getUsername(), otp));

        log.info("OTP sent to {}", request.getEmail());
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

        var userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());

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
                accessToken);
    }

    @Override
    public SignUpResponse passwordReset(PasswordResetRequest request) {
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        log.info("Password reset successful for user: {}", user.getEmail());
        userRepo.save(user);
        log.info("Password reset successful for user: {}", user.getEmail(), user.getPassword());
        return new SignUpResponse(user.getId(), user.getActualUsername(), user.getEmail());
    }

    @Override
    public TokenRefreshResponse refreshToken(HttpServletRequest request,
            HttpServletResponse response) {

        // 1️⃣ Read refresh token from HttpOnly cookie
        String refreshToken = cookieUtil.getRefreshToken(request);

        // 2️⃣ Verify refresh token (exists, not expired, not reused)
        RefreshToken storedToken = refreshTokenService.verifyRefreshToken(refreshToken);

        User user = storedToken.getUser();

        // 3️⃣ 🔥 MARK OLD TOKEN AS USED (reuse detection)
        storedToken.setUsed(true);
        refreshTokenRepo.save(storedToken);

        // 4️⃣ Generate NEW refresh token (rotation)
        String newRefreshToken = jwtUtil.generateRefreshToken(
                customUserDetailsService.loadUserByUsername(user.getEmail()));

        refreshTokenService.createRefreshToken(user, newRefreshToken);

        // 5️⃣ Set new refresh token in HttpOnly cookie
        cookieUtil.setRefreshToken(response, newRefreshToken);

        // 6️⃣ Generate new access token
        String newAccessToken = jwtUtil.generateAccessToken(
                customUserDetailsService.loadUserByUsername(user.getEmail()));

        return new TokenRefreshResponse(newAccessToken);
    }

    @Override
    public void logout(HttpServletRequest request,
            HttpServletResponse response) {

        String refreshToken = cookieUtil.getRefreshToken(request);

        refreshTokenService.deleteByToken(refreshToken);
        cookieUtil.clearRefreshToken(response);
    }

    @Override
    public SignUpResponse verifyOtp(VerifyOtpRequest request) {

        PendingUser pendingUser = pendingUserRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("No pending registration found"));

        // 1️⃣ Check expiry
        if (pendingUser.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("OTP expired");
        }

        // 2️⃣ Match OTP
        String receivedOtp = request.getOtp().trim();
        log.debug("Verifying OTP - Received: '{}' (len={}), Stored Hash: '{}' (len={})",
                receivedOtp, receivedOtp.length(), pendingUser.getOtpHash(), pendingUser.getOtpHash().length());

        boolean otpMatches = OtpHasUtil.matches(receivedOtp, pendingUser.getOtpHash());
        log.debug("OTP Match Result: {}", otpMatches);

        if (!otpMatches) {
            throw new InvalidCredentialsException("Invalid OTP");
        }

        // 3️⃣ Create real user
        User user = new User();
        user.setEmail(pendingUser.getEmail());
        user.setUsername(pendingUser.getUsername());
        user.setPassword(pendingUser.getPassword());
        user.setFirstName(pendingUser.getFirstName());
        user.setLastName(pendingUser.getLastName());
        user.setRole(Role.USER);
        user.setEmailVerified(true);

        // Move temp profile image to permanent location
        if (pendingUser.getTempProfileImagePath() != null) {
            String permanentImagePath = fileStorageService.moveTempToPermanent(
                    pendingUser.getTempProfileImagePath());
            user.setProfileImageUrl(permanentImagePath);
        }

        User savedUser = userRepo.save(user);

        // 4️⃣ Cleanup
        pendingUserRepo.delete(pendingUser);

        // 5️⃣ Welcome email
        emailService.sendEmail(
                savedUser.getEmail(),
                "Welcome to Blog Platform 🎉",
                EmailTemplateUtil.welcomeEmail(savedUser.getActualUsername()));

        return new SignUpResponse(
                savedUser.getId(),
                savedUser.getActualUsername(),
                savedUser.getEmail());
    }

    @Override
    public void resendOtp(String email) {
        PendingUser pendingUser = pendingUserRepo.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("No pending registration found"));

        // Rate limiting: max 5 OTP requests
        if (pendingUser.getOtpRequestCount() >= 5) {
            throw new InvalidCredentialsException(
                    "Too many OTP requests. Please register again.");
        }

        // Generate new OTP
        String otp = OTPGenerator.generateOtp();

        // Update pending user
        pendingUser.setOtpHash(OtpHasUtil.hash(otp));
        pendingUser.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        pendingUser.setOtpRequestCount(pendingUser.getOtpRequestCount() + 1);
        pendingUser.setLastOtpRequestAt(LocalDateTime.now());

        pendingUserRepo.save(pendingUser);

        // Send new OTP email
        emailService.sendEmail(
                email,
                "Verify your email - Blog Platform 🔐",
                EmailTemplateUtil.otpEmail(pendingUser.getUsername(), otp));

        log.info("OTP resent to {} (attempt {}/5)", email, pendingUser.getOtpRequestCount());
    }
}
