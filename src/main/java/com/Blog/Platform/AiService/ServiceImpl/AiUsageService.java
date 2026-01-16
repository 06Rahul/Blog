package com.Blog.Platform.AiService.ServiceImpl;

import com.Blog.Platform.AiService.DTO.AiUsageResponse;
import com.Blog.Platform.AiService.Exception.AiLimitExceededException;
import com.Blog.Platform.AiService.Model.AiFeature;
import com.Blog.Platform.AiService.Model.AiUsage;
import com.Blog.Platform.AiService.Repo.AiUsageRepository;
import com.Blog.Platform.Blog.ServiceImpl.BlogServiceImpl;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.Model.Role;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import static com.Blog.Platform.AiService.Model.AiFeature.*;

@Service
@RequiredArgsConstructor
public class AiUsageService {

    private final AiUsageRepository repo;
    private final UserRepo userRepo;

    public void validateAndIncrement(AiFeature feature) {

        User user = getCurrentUser();
        LocalDate today = LocalDate.now();

        int limit = resolveLimit(user, feature);

        AiUsage usage = repo
                .findByUserAndDateAndFeature(user, today, feature)
                .orElseGet(() -> {
                    AiUsage u = new AiUsage();
                    u.setUser(user);
                    u.setDate(today);
                    u.setFeature(feature);
                    u.setCount(0);
                    return u;
                });

        if (usage.getCount() >= limit) {
            throw new AiLimitExceededException(
                    feature + " AI limit exceeded"
            );
        }

        usage.setCount(usage.getCount() + 1);
        repo.save(usage);
    }

    public AiUsageResponse getTodayUsage() {

        User user = getCurrentUser();
        LocalDate today = LocalDate.now();

        int used = repo.findAllByUserAndDate(user, today)
                .stream()
                .mapToInt(AiUsage::getCount)
                .sum();

        int limit = resolveDailyLimit(user);

        return new AiUsageResponse(
                used,
                limit,
                Math.max(limit - used, 0)
        );
    }

    /* ===================== HELPERS ===================== */

    private int resolveLimit(User user, AiFeature feature) {
        if (user.getRole() == Role.ADMIN) {
            return Integer.MAX_VALUE;
        }

        return switch (feature) {
            case SUMMARY -> 20;
            case GRAMMAR -> 50;
            case ENHANCE -> 30;
            case TITLE -> 50;
            default -> 0;
        };
    }

    private int resolveDailyLimit(User user) {
        if (user.getRole() == Role.ADMIN) {
            return Integer.MAX_VALUE;
        }
        return 1000;
    }

    private User getCurrentUser() {
        String email = SecurityUtil.getCurrentUserEmai();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
