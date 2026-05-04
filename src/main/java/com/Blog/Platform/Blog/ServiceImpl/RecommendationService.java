package com.Blog.Platform.Blog.ServiceImpl;

import com.Blog.Platform.AiService.Client.GeminiClient;
import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Mapper.BlogPostMapper;
import com.Blog.Platform.Blog.Model.BlogMetadata;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Repo.BlogMetadataRepository;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final BlogMetadataRepository blogMetadataRepo;
    private final BlogPostRepository blogPostRepository;
    private final BlogPostMapper blogPostMapper;
    private final GeminiClient geminiClient;

    @Cacheable(value = "recommendations", key = "#blogId")
    public List<BlogPostResponse> getRecommendations(UUID blogId, int limit) {
        
        BlogPost sourcePost = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found"));

        List<String> keywords = blogMetadataRepo.findByBlogId(blogId).stream()
                .map(BlogMetadata::getKeyword)
                .toList();

        if (keywords.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> candidateIds = blogMetadataRepo.findTopRelatedBlogs(
                keywords, blogId, PageRequest.of(0, 20));

        if (candidateIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<BlogPost> candidates = blogPostRepository.findAllById(candidateIds);
        
        List<BlogPostResponse> recommended;
        try {
            String candidateList = candidates.stream()
                    .map(c -> c.getId() + " - " + c.getTitle())
                    .collect(Collectors.joining("\n"));

            String prompt = "Given the source blog titled '" + sourcePost.getTitle() + 
                            "', rank these candidate titles by relevance. Return ONLY their IDs strictly in order, comma-separated:\n" + 
                            candidateList;

            String response = geminiClient.call(prompt).trim();
            List<String> orderedIds = Arrays.stream(response.split(","))
                    .map(String::trim)
                    .toList();

            Map<String, BlogPost> candidateMap = candidates.stream()
                    .collect(Collectors.toMap(c -> c.getId().toString(), c -> c));

            recommended = orderedIds.stream()
                    .filter(candidateMap::containsKey)
                    .map(id -> blogPostMapper.toResponse(candidateMap.get(id)))
                    .limit(limit)
                    .toList();

        } catch (Exception e) {
            log.warn("Gemini refinement failed, falling back to overlap order: {}", e.getMessage());
            recommended = candidates.stream()
                    .map(blogPostMapper::toResponse)
                    .limit(limit)
                    .toList();
        }

        return recommended;
    }
}
