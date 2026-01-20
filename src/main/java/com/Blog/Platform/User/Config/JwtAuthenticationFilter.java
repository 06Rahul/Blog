
package com.Blog.Platform.User.Config;

import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService) {
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/api/user/login")
                || path.equals("/api/user/signup")
                || path.equals("/api/user/verify-otp")
                || path.equals("/api/user/refresh");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();

            try {
                if (!jwtUtil.isAccessToken(token)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String username = jwtUtil.extractUsername(token);
                Date issuedAt = jwtUtil.extractIssuedAt(token);

                if (SecurityContextHolder.getContext().getAuthentication() == null) {

                    UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                    // 🔐 CRITICAL PART — invalidate token after password reset
                    if (userDetails instanceof User user) {
                        LocalDateTime pwdChangedAt = user.getPasswordChangedAt();

                        if (pwdChangedAt != null &&
                                issuedAt.toInstant().isBefore(
                                        pwdChangedAt.atZone(ZoneId.systemDefault()).toInstant())) {
                            throw new RuntimeException("JWT expired due to password reset");
                        }
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }

            } catch (Exception ex) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
