package com.Blog.Platform.AiService.ServiceImpl;

import com.Blog.Platform.AiService.Service.AiService;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncAiWorker {

    private final AiService aiService;
    private final BlogPostRepository blogRepo;

    @Async
    @Transactional
    public void generateSummary(UUID blogId, String content) {

        try {
            String summary = aiService.summarize(content);

            blogRepo.findById(blogId).ifPresent(blog -> {
                blog.setSummary(summary);
            });

        } catch (Exception ex) {
            log.warn("Async AI summary failed for blog {}", blogId, ex);
        }
    }
}
