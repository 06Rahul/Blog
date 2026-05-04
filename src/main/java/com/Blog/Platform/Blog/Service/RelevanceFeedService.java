package com.Blog.Platform.Blog.Service;

import com.Blog.Platform.Blog.Model.Tag;
import com.Blog.Platform.Blog.Model.UserTagAffinity;
import com.Blog.Platform.Blog.Repository.UserTagAffinityRepository;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RelevanceFeedService {

    private final UserTagAffinityRepository affinityRepository;
    private final UserRepo userRepository;

    @Async
    @Transactional
    public void recordAffinity(UUID userId, Set<Tag> tags, float weight) {
        if (userId == null || tags == null || tags.isEmpty()) return;

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        for (Tag tag : tags) {
            String tagName = tag.getName();
            if (tagName == null || tagName.isBlank()) continue;

            UserTagAffinity affinity = affinityRepository.findByUserIdAndTag(userId, tagName)
                    .orElseGet(() -> {
                        UserTagAffinity newAffinity = new UserTagAffinity();
                        newAffinity.setUser(user);
                        newAffinity.setTag(tagName);
                        newAffinity.setAffinityScore(0f);
                        return newAffinity;
                    });

            affinity.setAffinityScore(affinity.getAffinityScore() + weight);
            affinityRepository.save(affinity);
        }
    }
}
