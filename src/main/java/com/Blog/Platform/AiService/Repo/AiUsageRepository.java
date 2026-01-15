package com.Blog.Platform.AiService.Repo;

import com.Blog.Platform.AiService.Model.AiFeature;
import com.Blog.Platform.AiService.Model.AiUsage;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiUsageRepository extends JpaRepository<AiUsage, UUID> {

    Optional<AiUsage> findByUserAndDateAndFeature(
            User user,
            LocalDate date,
            AiFeature feature
    );

    List<AiUsage> findAllByUserAndDate(User user, LocalDate date);
}

