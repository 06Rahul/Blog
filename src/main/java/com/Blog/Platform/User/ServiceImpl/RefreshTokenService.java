package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.User.Model.RefreshToken;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.RefreshTokenRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepo refreshTokenRepo;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    public RefreshToken createRefreshToken(User user, String token) {

        refreshTokenRepo.deleteByUser(user); // single-session

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(token);
        refreshToken.setExpiryDate(
                LocalDateTime.now().plusSeconds(refreshExpiration / 1000)
        );

        return refreshTokenRepo.save(refreshToken);
    }

    public RefreshToken verifyRefreshToken(String token) {

        RefreshToken refreshToken = refreshTokenRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.isUsed()) {
            refreshTokenRepo.deleteByUser(refreshToken.getUser());
            throw new RuntimeException("Refresh token reuse detected");
        }

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepo.delete(refreshToken);
            throw new RuntimeException("Refresh token expired");
        }

        return refreshToken;
    }


    public void delete(RefreshToken refreshToken) {
        refreshTokenRepo.delete(refreshToken);
    }

    public void deleteByToken(String token) {
        refreshTokenRepo.findByToken(token)
                .ifPresent(refreshTokenRepo::delete);
    }
}
