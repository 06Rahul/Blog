package com.Blog.Platform.Blog.Mapper;

import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Model.BlogPost;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BlogPostMapper {

    private final com.Blog.Platform.User.Repo.CreditLedgerRepository creditLedgerRepo;
    private final com.Blog.Platform.Blog.Repository.PostCoauthorRepository coauthorRepo;

    public BlogPostResponse toResponse(BlogPost blog) {
        int kudosCount = creditLedgerRepo != null ? creditLedgerRepo.countTipsReceptedForBlog(blog.getId()).orElse(0) : 0;
        
        java.util.List<com.Blog.Platform.Blog.DTO.CoauthorDto> coauthors = new java.util.ArrayList<>();
        if (coauthorRepo != null) {
            coauthors = coauthorRepo.findByBlogIdAndStatus(blog.getId(), com.Blog.Platform.Blog.Model.CoauthorStatus.ACCEPTED)
                    .stream()
                    .map(c -> new com.Blog.Platform.Blog.DTO.CoauthorDto(c.getSubjectUser().getId(), c.getSubjectUser().getActualUsername()))
                    .toList();
        }
        
        return new BlogPostResponse(
                blog.getId(),
                blog.getTitle(),
                blog.getContent(),
                blog.getSummary(),
                blog.getStatus(),
                blog.getAuthor().getId(),
                blog.getAuthor().getActualUsername(),
                new BlogPostResponse.AuthorSummary(
                        blog.getAuthor().getId(),
                        blog.getAuthor().getActualUsername()
                ),
                blog.getCreatedAt(),
                blog.getUpdatedAt(),
                blog.getPublishedAt(),
                blog.getCategory() == null ? null : new BlogPostResponse.CategorySummary(
                        blog.getCategory().getId(),
                        blog.getCategory().getName()
                ),
                blog.getCommunity() == null ? null : new BlogPostResponse.CommunitySummary(
                        blog.getCommunity().getId(),
                        blog.getCommunity().getName()
                ),
                blog.isCommunityExclusive(),
                blog.getTags().stream()
                        .map(tag -> new BlogPostResponse.TagSummary(tag.getId(), tag.getName()))
                        .toList(),
                blog.getPollId(),
                kudosCount,
                coauthors
        );

    }
}
