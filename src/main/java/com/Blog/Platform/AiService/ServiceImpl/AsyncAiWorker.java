package com.Blog.Platform.AiService.ServiceImpl;

import com.Blog.Platform.AiService.Service.AiService;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AsyncAiWorker {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AsyncAiWorker.class);

    private final AiService aiService;
    private final BlogPostRepository blogRepo;

    public AsyncAiWorker(AiService aiService, BlogPostRepository blogRepo) {
        this.aiService = aiService;
        this.blogRepo = blogRepo;
    }

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
