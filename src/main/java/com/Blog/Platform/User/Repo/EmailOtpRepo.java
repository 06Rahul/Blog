package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

public interface EmailOtpRepo extends JpaRepository<EmailOtp, String> {

    Optional<EmailOtp> findTopByEmailOrderByExpiresAtDesc(String email);
}
