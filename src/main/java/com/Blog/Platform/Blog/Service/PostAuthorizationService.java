package com.Blog.Platform.Blog.Service;

import com.Blog.Platform.Blog.Exception.ResourceNotFoundException;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.CoauthorStatus;

import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Repository.PostCoauthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostAuthorizationService {

    private final BlogPostRepository blogPostRepository;
    private final PostCoauthorRepository postCoauthorRepository;

    public boolean canEdit(UUID blogId, UUID userId) {
        BlogPost blogPost = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found."));

        if (blogPost.getAuthor().getId().equals(userId)) {
            return true;
        }

        return postCoauthorRepository.existsByBlogIdAndSubjectUserIdAndStatus(blogId, userId, CoauthorStatus.ACCEPTED);
    }
}
