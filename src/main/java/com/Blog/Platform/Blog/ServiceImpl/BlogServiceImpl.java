package com.Blog.Platform.Blog.ServiceImpl;

import com.Blog.Platform.Blog.DTO.BlogPostRequest;
import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Exception.BlogCreationException;
import com.Blog.Platform.Blog.Mapper.BlogPostMapper;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.BlogStatus;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Service.BlogService;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.Excepction.UserNotFoundException;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;
@Service
@RequiredArgsConstructor
@Transactional
public class BlogServiceImpl implements BlogService {

    private final BlogPostMapper blogPostMapper;
    private final BlogPostRepository blogPostRepository;
    private final UserRepo userRepo;


    @Override
    public Page<BlogPostResponse> searchByTitle(String title, Pageable pageable) {
        return blogPostRepository
                .findByTitleContainingIgnoreCaseAndStatus(
                        title, BlogStatus.PUBLISHED, pageable)
                .map(blogPostMapper::toResponse);
    }

    @Override
    public Page<BlogPostResponse> searchByTag(String tag, Pageable pageable) {
        return blogPostRepository
                .findByTag(tag, pageable)
                .map(blogPostMapper::toResponse);
    }

    @Override
    public Page<BlogPostResponse> searchByAuthor(String username, Pageable pageable) {
        return blogPostRepository
                .findByAuthorUsername(username, pageable)
                .map(blogPostMapper::toResponse);
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

        BlogPost savedBlog = blogPostRepository.save(blogPost);
        return blogPostMapper.toResponse(savedBlog);
    }

    /* ===================== READ ===================== */

    @Override
    public Page<BlogPostResponse> getMyDrafts(Pageable pageable) {
        User author = getCurrentUser();
        return blogPostRepository
                .findByAuthorAndStatus(author, BlogStatus.DRAFT, pageable)
                .map(blogPostMapper::toResponse);
    }

    @Override
    public Page<BlogPostResponse> getMyPublishedBlogs(Pageable pageable) {
        User author = getCurrentUser();
        return blogPostRepository
                .findByAuthorAndStatus(author, BlogStatus.PUBLISHED, pageable)
                .map(blogPostMapper::toResponse);
    }

    @Override
    public Page<BlogPostResponse> getPublishedBlogs(Pageable pageable) {
        return blogPostRepository
                .findByStatus(BlogStatus.PUBLISHED, pageable)
                .map(blogPostMapper::toResponse);
    }

    @Override
    public BlogPostResponse getMyBlogById(UUID blogId) {
        User author = getCurrentUser();

        BlogPost blog = blogPostRepository
                .findByIdAndAuthor(blogId, author)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));

        return blogPostMapper.toResponse(blog);
    }

    /* ===================== UPDATE ===================== */

    @Override
    public BlogPostResponse updateDraft(UUID blogId, BlogPostRequest request) {
        User author = getCurrentUser();

        BlogPost blog = blogPostRepository
                .findByIdAndAuthor(blogId, author)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));

        if (blog.getStatus() != BlogStatus.DRAFT) {
            throw new BlogCreationException("Only DRAFT blogs can be updated");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            blog.setTitle(request.getTitle());
        }

        if (request.getContent() != null && !request.getContent().isBlank()) {
            blog.setContent(request.getContent());
        }

        return blogPostMapper.toResponse(blog);
    }

    /* ===================== PUBLISH ===================== */

    @Override
    public BlogPostResponse publishBlog(UUID blogId) {
        User author = getCurrentUser();

        BlogPost blog = blogPostRepository
                .findByIdAndAuthor(blogId, author)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));

        if (blog.getStatus() != BlogStatus.DRAFT) {
            throw new BlogCreationException("Only DRAFT blogs can be published");
        }

        blog.setStatus(BlogStatus.PUBLISHED);
        blog.setPublishedAt(java.time.LocalDateTime.now());

        return blogPostMapper.toResponse(blog);
    }

    /* ===================== DELETE ===================== */

    @Override
    public void deleteMyBlog(UUID blogId) {
        User author = getCurrentUser();

        BlogPost blog = blogPostRepository
                .findByIdAndAuthor(blogId, author)
                .orElseThrow(() -> new BlogCreationException("Blog not found"));

        blogPostRepository.delete(blog);
    }


    private User getCurrentUser() {
        String email = SecurityUtil.getCurrentUserEmai();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

}

