package com.Blog.Platform.Blog.ServiceImpl;

import com.Blog.Platform.Blog.Model.BlogMetadata;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Repo.BlogMetadataRepository;
import com.Blog.Platform.AiService.Service.AiService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BlogMetadataService {

    private final BlogMetadataRepository blogMetadataRepo;
    private final AiService geminiAiService;

    public BlogMetadataService(BlogMetadataRepository blogMetadataRepo, AiService geminiAiService) {
        this.blogMetadataRepo = blogMetadataRepo;
        this.geminiAiService = geminiAiService;
    }

    @Async
    @Transactional
    public void indexBlogKeywords(BlogPost post) {
        blogMetadataRepo.deleteByBlogId(post.getId());
        List<String> keywords = geminiAiService.extractKeywords(post.getTitle(), post.getContent());
        List<BlogMetadata> entries = keywords.stream()
                .map(kw -> new BlogMetadata(post.getId(), kw, 1.0f))
                .toList();
        blogMetadataRepo.saveAll(entries);
    }
}
