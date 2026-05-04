package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.User.Config.CustomUserDetailsService;
import com.Blog.Platform.User.DTO.ApiMessageResponse;
import com.Blog.Platform.User.DTO.OtpDispatchResponse;
import com.Blog.Platform.User.DTO.PasswordResetConfirmRequest;
import com.Blog.Platform.User.DTO.ResendOtpRequest;
import com.Blog.Platform.User.DTO.SignInRequest;
import com.Blog.Platform.User.DTO.SignInResponse;
import com.Blog.Platform.User.DTO.SignUpRequest;
import com.Blog.Platform.User.DTO.SignUpResponse;
import com.Blog.Platform.User.DTO.TokenRefreshResponse;
import com.Blog.Platform.User.DTO.UsernameAvailabilityResponse;
import com.Blog.Platform.User.DTO.VerifyOtpRequest;
import com.Blog.Platform.User.Excepction.InvalidCredentialsException;
import com.Blog.Platform.User.Excepction.UserAlreadyExistsException;
import com.Blog.Platform.User.Model.EmailOtp;
import com.Blog.Platform.User.Model.PendingUser;
import com.Blog.Platform.User.Model.RefreshToken;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.EmailOtpRepo;
import com.Blog.Platform.User.Repo.PendingUserRepo;
import com.Blog.Platform.User.Repo.RefreshTokenRepo;
import com.Blog.Platform.User.Repo.UserRepo;
import com.Blog.Platform.User.Service.AuthService;
import com.Blog.Platform.User.Service.VirtualKudosService;
import com.Blog.Platform.User.UserMapper.UserMapper;
import com.Blog.Platform.User.Utils.CookieUtil;
import com.Blog.Platform.User.Utils.JwtUtil;
import com.Blog.Platform.User.Utils.OTPGenerator;
import com.Blog.Platform.User.Utils.OtpHasUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final int OTP_TTL_MINUTES = 10;
    private static final int OTP_RESEND_LIMIT = 5;
    private static final int OTP_RESEND_COOLDOWN_SECONDS = 30;
    private static final int USERNAME_SUGGESTION_LIMIT = 4;

    private final CookieUtil cookieUtil;
    private final RefreshTokenRepo refreshTokenRepo;
    private final JwtUtil jwtUtil;
    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final CustomUserDetailsService customUserDetailsService;
    private final FileStorageServiceImpl fileStorageService;
    private final VirtualKudosService kudosService;
    private final PendingUserRepo pendingUserRepo;
    private final EmailOtpRepo emailOtpRepo;

    @Override
    public SignUpResponse register(SignUpRequest request, MultipartFile image) {
        String email = normalizeEmail(request.getEmail());
        String username = normalizeUsername(request.getUsername());

        if (userRepo.existsByEmailIgnoreCase(email)) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        if (userRepo.existsByUsernameIgnoreCase(username)) {
            throw new UserAlreadyExistsException("Username already taken");
        }

        Optional<PendingUser> conflictingPendingUsername = pendingUserRepo.findByUsernameIgnoreCase(username);
        if (conflictingPendingUsername.isPresent()
                && !conflictingPendingUsername.get().getEmail().equalsIgnoreCase(email)
                && !isExpired(conflictingPendingUsername.get().getExpiresAt())) {
            throw new UserAlreadyExistsException("Username already taken");
        }

        PendingUser pendingUser = pendingUserRepo.findByEmailIgnoreCase(email)
                .orElseGet(PendingUser::new);

        if (image != null && !image.isEmpty() && pendingUser.getTempProfileImagePath() != null) {
            fileStorageService.deleteImage(pendingUser.getTempProfileImagePath());
        }

        String otp = OTPGenerator.generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES);

        pendingUser.setEmail(email);
        pendingUser.setUsername(username);
        pendingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        pendingUser.setFirstName(trimToNull(request.getFirstName()));
        pendingUser.setLastName(trimToNull(request.getLastName()));
        pendingUser.setBio(trimToNull(request.getBio()));
        pendingUser.setWebsite(trimToNull(request.getWebsite()));
        pendingUser.setMobileNumber(trimToNull(request.getMobileNumber()));
        pendingUser.setOtpHash(OtpHasUtil.hash(otp));
        pendingUser.setExpiresAt(expiresAt);
        pendingUser.setOtpRequestCount(1);
        pendingUser.setLastOtpRequestAt(LocalDateTime.now());

        if (image != null && !image.isEmpty()) {
            pendingUser.setTempProfileImagePath(fileStorageService.saveImage(image));
        }

        pendingUserRepo.save(pendingUser);

        log.info("Signup OTP for {}: {}", email, otp);

        return new SignUpResponse(
                username,
                email,
                "OTP sent. Verify your email to complete registration.",
                true,
                expiresAt
        );
    }

    @Override
    public ApiMessageResponse verifySignupOtp(VerifyOtpRequest request) {
        PendingUser pendingUser = pendingUserRepo.findByEmailIgnoreCase(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new IllegalArgumentException("No pending signup found for this email"));

        validateOtp(request.getOtp(), pendingUser.getOtpHash(), pendingUser.getExpiresAt(), "Invalid or expired OTP");

        if (userRepo.existsByEmailIgnoreCase(pendingUser.getEmail())) {
            pendingUserRepo.delete(pendingUser);
            throw new UserAlreadyExistsException("Email already registered");
        }

        if (userRepo.existsByUsernameIgnoreCase(pendingUser.getUsername())) {
            throw new UserAlreadyExistsException("Username already taken");
        }

        User user = userMapper.toEntity(buildSignUpRequestFromPending(pendingUser));
        user.setPassword(pendingUser.getPassword());
        user.setProfileImageUrl(pendingUser.getTempProfileImagePath());
        user.setEmailVerified(true);

        userRepo.save(user);
        pendingUserRepo.delete(pendingUser);

        return new ApiMessageResponse("Registration verified successfully. Please sign in.");
    }

    @Override
    public OtpDispatchResponse resendSignupOtp(ResendOtpRequest request) {
        PendingUser pendingUser = pendingUserRepo.findByEmailIgnoreCase(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new IllegalArgumentException("No pending signup found for this email"));

        enforceResendLimits(
                pendingUser.getOtpRequestCount(),
                pendingUser.getLastOtpRequestAt(),
                "Too many OTP requests. Please sign up again."
        );

        String otp = OTPGenerator.generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES);

        pendingUser.setOtpHash(OtpHasUtil.hash(otp));
        pendingUser.setExpiresAt(expiresAt);
        pendingUser.setOtpRequestCount(pendingUser.getOtpRequestCount() + 1);
        pendingUser.setLastOtpRequestAt(LocalDateTime.now());
        pendingUserRepo.save(pendingUser);

        log.info("Signup OTP resend for {}: {}", pendingUser.getEmail(), otp);

        return new OtpDispatchResponse(
                pendingUser.getEmail(),
                "A new OTP has been generated.",
                expiresAt
        );
    }

    @Override
    public OtpDispatchResponse requestPasswordResetOtp(ResendOtpRequest request) {
        String email = normalizeEmail(request.getEmail());
        userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found for this email"));

        String otp = OTPGenerator.generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES);

        emailOtpRepo.deleteByEmail(email);

        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(email);
        emailOtp.setOtpHash(OtpHasUtil.hash(otp));
        emailOtp.setExpiresAt(expiresAt);
        emailOtp.setVerified(false);
        emailOtpRepo.save(emailOtp);

        log.info("Password reset OTP for {}: {}", email, otp);

        return new OtpDispatchResponse(
                email,
                "Password reset OTP generated.",
                expiresAt
        );
    }

    @Override
    public ApiMessageResponse verifyPasswordResetOtp(VerifyOtpRequest request) {
        EmailOtp emailOtp = emailOtpRepo.findTopByEmailIgnoreCaseOrderByExpiresAtDesc(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new IllegalArgumentException("No password reset request found"));

        validateOtp(request.getOtp(), emailOtp.getOtpHash(), emailOtp.getExpiresAt(), "Invalid or expired OTP");

        emailOtp.setVerified(true);
        emailOtpRepo.save(emailOtp);

        return new ApiMessageResponse("OTP verified. You can reset your password now.");
    }

    @Override
    public ApiMessageResponse resetPasswordWithOtp(PasswordResetConfirmRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found for this email"));

        EmailOtp emailOtp = emailOtpRepo.findTopByEmailIgnoreCaseOrderByExpiresAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("No password reset request found"));

        validateOtp(request.getOtp(), emailOtp.getOtpHash(), emailOtp.getExpiresAt(), "Invalid or expired OTP");

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);
        emailOtpRepo.deleteByEmail(email);

        return new ApiMessageResponse("Password reset successful. Please sign in.");
    }

    @Override
    @Transactional(readOnly = true)
    public UsernameAvailabilityResponse checkUsernameAvailability(String username) {
        String normalized = normalizeUsername(username);
        if (normalized.length() < 3) {
            return new UsernameAvailabilityResponse(
                    false,
                    "Username must be at least 3 characters long.",
                    List.of()
            );
        }

        boolean taken = isUsernameTaken(normalized);
        if (!taken) {
            return new UsernameAvailabilityResponse(true, "Username is available.", List.of());
        }

        return new UsernameAvailabilityResponse(
                false,
                "Username already taken. Try another one.",
                buildUsernameSuggestions(normalized)
        );
    }

    @Override
    public SignInResponse login(SignInRequest request, HttpServletResponse response) {
        User user = userRepo.findByEmailIgnoreCase(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepo.save(user);

        try {
            kudosService.awardPoints(
                    user.getId(),
                    null,
                    com.Blog.Platform.User.Model.TransactionType.EARN_LOGIN,
                    1,
                    user.getId().toString() + "-" + LocalDate.now()
            );
        } catch (Exception e) {
            log.warn("Failed to award daily login points for {}", user.getEmail(), e);
        }

        var userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        refreshTokenService.createRefreshToken(user, refreshToken);
        cookieUtil.setRefreshToken(response, refreshToken);

        return new SignInResponse(
                user.getId(),
                user.getEmail(),
                user.getActualUsername(),
                user.getRole().name(),
                user.getProfileImageUrl(),
                accessToken
        );
    }

    @Override
    public TokenRefreshResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieUtil.getRefreshToken(request);

        RefreshToken storedToken = refreshTokenService.verifyRefreshToken(refreshToken);
        User user = storedToken.getUser();

        storedToken.setUsed(true);
        refreshTokenRepo.save(storedToken);

        String newRefreshToken = jwtUtil.generateRefreshToken(
                customUserDetailsService.loadUserByUsername(user.getEmail())
        );

        refreshTokenService.createRefreshToken(user, newRefreshToken);
        cookieUtil.setRefreshToken(response, newRefreshToken);

        String newAccessToken = jwtUtil.generateAccessToken(
                customUserDetailsService.loadUserByUsername(user.getEmail())
        );

        return new TokenRefreshResponse(newAccessToken);
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieUtil.getRefreshToken(request);
        refreshTokenService.deleteByToken(refreshToken);
        cookieUtil.clearRefreshToken(response);
    }

    private void validateOtp(String rawOtp, String otpHash, LocalDateTime expiresAt, String errorMessage) {
        if (isExpired(expiresAt) || !OtpHasUtil.matches(rawOtp, otpHash)) {
            throw new IllegalArgumentException(errorMessage);
        }
    }

    private void enforceResendLimits(int requestCount, LocalDateTime lastRequestedAt, String errorMessage) {
        if (requestCount >= OTP_RESEND_LIMIT) {
            throw new IllegalArgumentException(errorMessage);
        }

        if (lastRequestedAt != null && lastRequestedAt.plusSeconds(OTP_RESEND_COOLDOWN_SECONDS).isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Please wait before requesting another OTP.");
        }
    }

    private boolean isExpired(LocalDateTime expiresAt) {
        return expiresAt == null || expiresAt.isBefore(LocalDateTime.now());
    }

    private boolean isUsernameTaken(String username) {
        if (userRepo.existsByUsernameIgnoreCase(username)) {
            return true;
        }

        Optional<PendingUser> pendingUser = pendingUserRepo.findByUsernameIgnoreCase(username);
        return pendingUser.isPresent() && !isExpired(pendingUser.get().getExpiresAt());
    }

    private List<String> buildUsernameSuggestions(String requestedUsername) {
        String base = sanitizeUsernameBase(requestedUsername);
        List<String> suggestions = new ArrayList<>();

        String[] staticCandidates = new String[] {
                base + "_writes",
                base + "_hub",
                "hey" + base,
                base + "daily"
        };

        for (String candidate : staticCandidates) {
            appendIfAvailable(suggestions, candidate);
        }

        int suffix = 1;
        while (suggestions.size() < USERNAME_SUGGESTION_LIMIT && suffix < 1000) {
            appendIfAvailable(suggestions, base + suffix);
            suffix += 17;
        }

        return suggestions;
    }

    private void appendIfAvailable(List<String> suggestions, String candidate) {
        String normalized = normalizeUsername(candidate);
        if (normalized.length() < 3 || normalized.length() > 50) {
            return;
        }

        if (!isUsernameTaken(normalized) && !suggestions.contains(normalized)) {
            suggestions.add(normalized);
        }
    }

    private String sanitizeUsernameBase(String username) {
        String sanitized = normalizeUsername(username)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9._-]", "");

        if (sanitized.length() < 3) {
            sanitized = (sanitized + "user").substring(0, Math.min(4, sanitized.length() + 4));
        }

        return sanitized;
    }

    private String normalizeEmail(String email) {
        return trimToNull(email).toLowerCase(Locale.ROOT);
    }

    private String normalizeUsername(String username) {
        String value = trimToNull(username);
        if (value == null) {
            throw new IllegalArgumentException("Username is required");
        }
        return value;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private SignUpRequest buildSignUpRequestFromPending(PendingUser pendingUser) {
        SignUpRequest request = new SignUpRequest();
        request.setEmail(pendingUser.getEmail());
        request.setUsername(pendingUser.getUsername());
        request.setPassword(pendingUser.getPassword());
        request.setFirstName(pendingUser.getFirstName());
        request.setLastName(pendingUser.getLastName());
        request.setBio(pendingUser.getBio());
        request.setWebsite(pendingUser.getWebsite());
        request.setMobileNumber(pendingUser.getMobileNumber());
        return request;
    }
}
