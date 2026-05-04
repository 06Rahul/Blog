package com.Blog.Platform.Config;

import com.Blog.Platform.Blog.Model.RateLimitRecord;
import com.Blog.Platform.Blog.Repo.RateLimitRepository;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.Exception.RateLimitException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitRepository rateLimitRepository;

    @Override
    @Transactional
    public boolean preHandle(@org.springframework.lang.NonNull HttpServletRequest request, @org.springframework.lang.NonNull HttpServletResponse response, @org.springframework.lang.NonNull Object handler) {
        if (handler instanceof HandlerMethod handlerMethod) {
            RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);
            if (rateLimit == null) {
                rateLimit = handlerMethod.getBeanType().getAnnotation(RateLimit.class);
            }

            if (rateLimit != null) {
                String clientIp = getClientIp(request);
                String apiPath = request.getRequestURI();
                UUID userId = null;
                
                try {
                    userId = SecurityUtil.getCurrentUserId();
                } catch (Exception ignored) { }

                LocalDateTime windowStart = LocalDateTime.now().minusSeconds(rateLimit.windowSeconds());

                Optional<RateLimitRecord> recordOpt;
                if (userId != null) {
                    recordOpt = rateLimitRepository.findByUserIdAndApiPathAndWindowStartAfter(userId, apiPath, windowStart);
                } else {
                    recordOpt = rateLimitRepository.findByClientIpAndApiPathAndWindowStartAfter(clientIp, apiPath, windowStart);
                }

                if (recordOpt.isPresent()) {
                    RateLimitRecord record = recordOpt.get();
                    if (record.getRequestCount() >= rateLimit.requests()) {
                        throw new RateLimitException("Too many requests. Please try again later.");
                    }
                    record.setRequestCount(record.getRequestCount() + 1);
                    rateLimitRepository.save(record);
                } else {
                    RateLimitRecord newRecord = new RateLimitRecord();
                    newRecord.setClientIp(clientIp);
                    newRecord.setUserId(userId);
                    newRecord.setApiPath(apiPath);
                    newRecord.setWindowStart(LocalDateTime.now());
                    rateLimitRepository.save(newRecord);
                }
            }
        }
        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
