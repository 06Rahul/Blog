package com.Blog.Platform.Blog.Util;

import com.Blog.Platform.User.DTO.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

@RequiredArgsConstructor
public class SecurityUtil {
    
    public static String getCurrentUserEmail() {
        return getCustomUserDetails().getEmail();
    }

    public static UUID getCurrentUserId() {
        return getCustomUserDetails().getId();
    }

    private static CustomUserDetails getCustomUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return (CustomUserDetails) principal;
        }

        throw new IllegalStateException("Authentication principal is not of type CustomUserDetails");
    }
}
