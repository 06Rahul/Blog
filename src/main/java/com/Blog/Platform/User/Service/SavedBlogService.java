package com.Blog.Platform.User.Service;

import com.Blog.Platform.Blog.DTO.BlogPostResponse;
import com.Blog.Platform.Blog.Mapper.BlogPostMapper;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.User.Model.SavedBlog;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.SavedBlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavedBlogService {

    private final SavedBlogRepository savedBlogRepository;
    private final BlogPostRepository blogPostRepository;
    private final UserService userService;
    private final BlogPostMapper blogPostMapper;

    @Transactional
    public void saveBlog(UUID blogId) {
        User user = userService.getCurrentUser();
        BlogPost blog = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found"));

        if (savedBlogRepository.isBlogSaved(user, blog)) {
            return; // Already saved
        }

        SavedBlog savedBlog = new SavedBlog(user, blog);
        savedBlogRepository.save(savedBlog);
    }

    @Transactional
    public void unsaveBlog(UUID blogId) {
        User user = userService.getCurrentUser();
        BlogPost blog = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found"));

        savedBlogRepository.findSavedBlog(user, blog)
                .ifPresent(savedBlogRepository::delete);
    }

    public boolean isSaved(UUID blogId) {
        User user = userService.getCurrentUser();
        BlogPost blog = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found"));

        return savedBlogRepository.isBlogSaved(user, blog);
    }

    @Transactional(readOnly = true)
    public Page<BlogPostResponse> getSavedBlogs(Pageable pageable) {
        User user = userService.getCurrentUser();
        return savedBlogRepository.findMySavedBlogs(user, pageable)
                .map(SavedBlog::getBlog)
                .map(blogPostMapper::toResponse);
    }
}
