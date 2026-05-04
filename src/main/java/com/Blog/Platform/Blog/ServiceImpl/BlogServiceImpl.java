package com.Blog.Platform.Blog.ServiceImpl;

import com.Blog.Platform.AiService.Service.AiService;
import com.Blog.Platform.AiService.ServiceImpl.AsyncAiWorker;
import com.Blog.Platform.Blog.DTO.BlogPostRequest;
import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Exception.BlogCreationException;
import com.Blog.Platform.Blog.Mapper.BlogPostMapper;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.BlogStatus;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Repo.CategoryRepository;
import com.Blog.Platform.Blog.Repo.TagRepository;
import com.Blog.Platform.Blog.Service.BlogService;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.Community.Model.Community;
import com.Blog.Platform.Community.Repository.CommunityMemberRepository;
import com.Blog.Platform.Community.Repository.CommunityRepository;
import com.Blog.Platform.User.Excepction.UserNotFoundException;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BlogServiceImpl implements BlogService {

    private final BlogPostMapper blogPostMapper;
    private final BlogPostRepository blogPostRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepo userRepo;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final AiService aiService;
    private final AsyncAiWorker asyncAiWorker;
    private final com.Blog.Platform.User.Service.NotificationService notificationService;
    private final org.springframework.context.ApplicationEventPublisher applicationEventPublisher;
    private final com.Blog.Platform.Blog.Service.PostAuthorizationService postAuthorizationService;
    private final com.Blog.Platform.User.Service.BlockService blockService;

    @Override
    public Page<BlogPostResponse> searchByTitle(String title, Pageable pageable) {
        User user = tryGetCurrentUser();
        return filterPage(
                blogPostRepository.findByTitleContainingIgnoreCaseAndStatus(title, BlogStatus.PUBLISHED, pageable),
                user,
                pageable
        );
    }

    @Override
    public Page<BlogPostResponse> getRelevanceFeed(Pageable pageable) {
        User user = getCurrentUser();
        return filterPage(blogPostRepository.findRelevanceFeed(user.getId().toString(), pageable), user, pageable);
    }

    @Override
    public Page<BlogPostResponse> searchByTag(String tag, Pageable pageable) {
        User user = tryGetCurrentUser();
        return filterPage(blogPostRepository.findByTag(tag, pageable), user, pageable);
    }

    @Override
    public Page<BlogPostResponse> searchByAuthor(String username, Pageable pageable) {
        User user = tryGetCurrentUser();
        return filterPage(blogPostRepository.findByAuthorUsername(username, pageable), user, pageable);
    }

    @Override
    public BlogPostResponse createBlog(BlogPostRequest request) {
        User author = getCurrentUser();

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BlogCreationException("Blog title cannot be empty");
        }

        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new BlogCreationException("Blog content cannot be empty");
        }

        BlogPost blogPost = new BlogPost();
        blogPost.setAuthor(author);
        blogPost.setTitle(request.getTitle());
        blogPost.setContent(request.getContent());
        blogPost.setStatus(BlogStatus.DRAFT);
        blogPost.setReadingTime(calculateReadingTime(request.getContent()));
        if (request.getCoverImageUrl() != null) {
            blogPost.setCoverImageUrl(request.getCoverImageUrl());
        }
        applyRelationships(blogPost, request, author);

        var moderationResult = aiService.moderateContent(request.getContent() + " " + request.getTitle());
        if (!moderationResult.safe()) {
            blogPost.setModerationStatus(com.Blog.Platform.AiService.Model.ModerationStatus.REJECTED);
            blogPost.setModerationReason(moderationResult.reason());
            blogPostRepository.save(blogPost);
            notificationService.notifyModerationRejection(author, moderationResult.reason());
            throw new com.Blog.Platform.AiService.Exception.ContentModerationException(moderationResult.reason());
        }
        blogPost.setModerationStatus(com.Blog.Platform.AiService.Model.ModerationStatus.APPROVED);

        BlogPost savedBlog = blogPostRepository.save(blogPost);
        return blogPostMapper.toResponse(savedBlog);
    }

    @Override
    public Page<BlogPostResponse> getMyDrafts(Pageable pageable) {
        User author = getCurrentUser();
        return blogPostRepository.findByAuthorAndStatus(author, BlogStatus.DRAFT, pageable).map(blogPostMapper::toResponse);
    }

    @Override
    public Page<BlogPostResponse> getMyPublishedBlogs(Pageable pageable) {
        User author = getCurrentUser();
        return blogPostRepository.findByAuthorAndStatus(author, BlogStatus.PUBLISHED, pageable).map(blogPostMapper::toResponse);
    }

    @Override
    public Page<BlogPostResponse> getPublishedBlogs(UUID categoryId, Pageable pageable) {
        if (categoryId != null) {
            return filterPage(blogPostRepository.findByCategory_IdAndStatus(categoryId, BlogStatus.PUBLISHED, pageable), tryGetCurrentUser(), pageable);
        }
        return filterPage(blogPostRepository.findByStatus(BlogStatus.PUBLISHED, pageable), tryGetCurrentUser(), pageable);
    }

    @Override
    public Page<BlogPostResponse> getFollowingFeed(Pageable pageable) {
        User user = getCurrentUser();
        return filterPage(blogPostRepository.findFollowingFeed(user.getId(), pageable), user, pageable);
    }

    @Override
    public Page<BlogPostResponse> getTrendingFeed(Pageable pageable) {
        return filterPage(blogPostRepository.findTrendingFeed(pageable), tryGetCurrentUser(), pageable);
    }

    @Override
    public BlogPostResponse getPublishedBlogById(UUID blogId) {
        BlogPost blog = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));

        if (blog.getStatus() != BlogStatus.PUBLISHED) {
            throw new BlogCreationException("Blog is not published");
        }
        if (!canAccessPublishedBlog(tryGetCurrentUser(), blog)) {
            throw new BlogCreationException("You are not allowed to view this blog");
        }

        return blogPostMapper.toResponse(blog);
    }

    @Override
    public BlogPostResponse getMyBlogById(UUID blogId) {
        User author = getCurrentUser();
        BlogPost blog = blogPostRepository.findByIdAndAuthor(blogId, author)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));
        return blogPostMapper.toResponse(blog);
    }

    @Override
    public BlogPostResponse updateDraft(UUID blogId, BlogPostRequest request) {
        User author = getCurrentUser();
        BlogPost blog = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));

        if (!postAuthorizationService.canEdit(blogId, author.getId())) {
            throw new BlogCreationException("Not authorized to edit this blog");
        }
        if (blog.getStatus() != BlogStatus.DRAFT) {
            throw new BlogCreationException("Only DRAFT blogs can be updated");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            blog.setTitle(request.getTitle());
        }
        if (request.getContent() != null && !request.getContent().isBlank()) {
            blog.setContent(request.getContent());
        }

        blog.setReadingTime(calculateReadingTime(blog.getContent()));
        if (request.getCoverImageUrl() != null) {
            blog.setCoverImageUrl(request.getCoverImageUrl());
        }

        applyRelationships(blog, request, author);
        return blogPostMapper.toResponse(blogPostRepository.save(blog));
    }

    @Override
    public BlogPostResponse publishBlog(UUID blogId) {
        User author = getCurrentUser();
        BlogPost blog = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));

        if (!postAuthorizationService.canEdit(blogId, author.getId())) {
            throw new BlogCreationException("Not authorized to publish this blog");
        }
        if (blog.getStatus() != BlogStatus.DRAFT) {
            throw new BlogCreationException("Only DRAFT blogs can be published");
        }

        blog.setStatus(BlogStatus.PUBLISHED);
        blog.setPublishedAt(LocalDateTime.now());
        BlogPost saved = blogPostRepository.save(blog);

        asyncAiWorker.generateSummary(saved.getId(), saved.getContent());
        applicationEventPublisher.publishEvent(new com.Blog.Platform.Blog.Event.BlogPublishedEvent(this, saved));
        return blogPostMapper.toResponse(saved);
    }

    @Override
    public void deleteMyBlog(UUID blogId) {
        User author = getCurrentUser();
        BlogPost blog = blogPostRepository.findByIdAndAuthor(blogId, author)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));
        blogPostRepository.delete(blog);
    }

    public User getCurrentUser() {
        String email = SecurityUtil.getCurrentUserEmail();
        return userRepo.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private User tryGetCurrentUser() {
        try {
            return getCurrentUser();
        } catch (Exception ex) {
            return null;
        }
    }

    @Override
    public BlogPost getMyBlogEntity(UUID blogId) {
        User author = getCurrentUser();
        return blogPostRepository.findByIdAndAuthor(blogId, author)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));
    }

    @Override
    public BlogPostResponse schedulePost(UUID blogId, LocalDateTime publishAt) {
        User author = getCurrentUser();
        BlogPost blog = blogPostRepository.findByIdAndAuthor(blogId, author)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));

        if (blog.getStatus() != BlogStatus.DRAFT) {
            throw new BlogCreationException("Only DRAFT blogs can be scheduled");
        }
        if (publishAt.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("publishAt must be in the future");
        }

        blog.setStatus(BlogStatus.SCHEDULED);
        blog.setPublishAt(publishAt);
        return blogPostMapper.toResponse(blogPostRepository.save(blog));
    }

    @Override
    public BlogPostResponse cancelSchedule(UUID blogId) {
        User author = getCurrentUser();
        BlogPost blog = blogPostRepository.findByIdAndAuthor(blogId, author)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));

        if (blog.getStatus() != BlogStatus.SCHEDULED) {
            throw new BlogCreationException("Blog is not scheduled");
        }

        blog.setStatus(BlogStatus.DRAFT);
        blog.setPublishAt(null);
        return blogPostMapper.toResponse(blogPostRepository.save(blog));
    }

    @Override
    public Page<BlogPostResponse> getMyScheduledBlogs(Pageable pageable) {
        User author = getCurrentUser();
        return blogPostRepository.findByAuthorAndStatus(author, BlogStatus.SCHEDULED, pageable).map(blogPostMapper::toResponse);
    }

    private void applyRelationships(BlogPost blogPost, BlogPostRequest request, User author) {
        if (request.getCategoryId() != null) {
            var category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            blogPost.setCategory(category);
        } else {
            blogPost.setCategory(null);
        }

        if (request.getTags() != null) {
            var tagEntities = new HashSet<com.Blog.Platform.Blog.Model.Tag>();
            for (String tagName : request.getTags()) {
                if (tagName == null || tagName.trim().isEmpty()) continue;
                String normalizedName = tagName.trim().toLowerCase();
                com.Blog.Platform.Blog.Model.Tag tag = tagRepository.findByNameIgnoreCase(normalizedName)
                    .orElseGet(() -> {
                        com.Blog.Platform.Blog.Model.Tag newTag = new com.Blog.Platform.Blog.Model.Tag();
                        newTag.setName(normalizedName);
                        return tagRepository.save(newTag);
                    });
                tagEntities.add(tag);
            }
            blogPost.setTags(tagEntities);
        } else {
            blogPost.setTags(new HashSet<>());
        }

        applyCommunityAccess(blogPost, request, author);
    }

    private void applyCommunityAccess(BlogPost blogPost, BlogPostRequest request, User author) {
        if (request.getCommunityId() == null) {
            blogPost.setCommunity(null);
            blogPost.setCommunityExclusive(false);
            return;
        }

        Community community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));
        if (!communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), author.getId())) {
            throw new IllegalArgumentException("Only community members can post to this community");
        }

        blogPost.setCommunity(community);
        blogPost.setCommunityExclusive(request.isCommunityExclusive());
    }

    private boolean canAccessPublishedBlog(User user, BlogPost blogPost) {
        if (!blogPost.isCommunityExclusive() || blogPost.getCommunity() == null) {
            return true;
        }
        if (user == null) {
            return false;
        }
        if (blogPost.getAuthor().getId().equals(user.getId())) {
            return true;
        }
        return communityMemberRepository.existsByCommunityIdAndUserId(blogPost.getCommunity().getId(), user.getId());
    }

    private Page<BlogPostResponse> filterPage(Page<BlogPost> page, User user, Pageable pageable) {
        return new PageImpl<>(
                page.getContent().stream()
                        .filter(blog -> user == null || !blockService.isBlocked(user.getId(), blog.getAuthor().getId()))
                        .filter(blog -> canAccessPublishedBlog(user, blog))
                        .map(blogPostMapper::toResponse)
                        .toList(),
                pageable,
                page.getTotalElements()
        );
    }

    private int calculateReadingTime(String content) {
        if (content == null || content.trim().isEmpty()) {
            return 1;
        }
        int wordCount = content.split("\\s+").length;
        return Math.max(1, wordCount / 200);
    }
}
