package com.Blog.Platform.Blog.ServiceImpl;

import com.Blog.Platform.Blog.DTO.CommentRequest;
import com.Blog.Platform.Blog.DTO.CommentResponse;
import com.Blog.Platform.Blog.Mapper.CommentMapper;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.Comment;
import com.Blog.Platform.Blog.Model.Like;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Repository.CommentRepository;
import com.Blog.Platform.Blog.Repository.LikeRepository;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EngagementService {

    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final BlogPostRepository blogPostRepository;
    private final UserRepo userRepo;
    private final CommentMapper commentMapper;

    /* ===================== UTIL ===================== */

    private User getCurrentUser() {
        String email = SecurityUtil.getCurrentUserEmail();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    /* ===================== COMMENTS ===================== */

    public CommentResponse addComment(UUID blogId, CommentRequest request) {

        User author = getCurrentUser();

        BlogPost blog = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new EntityNotFoundException("Blog not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthor(author);
        comment.setBlog(blog);

        Comment saved = commentRepository.save(comment);
        return commentMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getComments(UUID blogId, Pageable pageable) {

        return commentRepository
                .findByBlog_IdOrderByCreatedAtDesc(blogId, pageable)
                .map(commentMapper::toResponse);
    }

    /* ===================== LIKES ===================== */

    public void toggleLike(UUID blogId) {

        User user = getCurrentUser();

        BlogPost blog = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new EntityNotFoundException("Blog not found"));

        likeRepository.findByUserAndBlog(user, blog)
                .ifPresentOrElse(
                        likeRepository::delete,
                        () -> {
                            Like like = new Like();
                            like.setUser(user);
                            like.setBlog(blog);
                            likeRepository.save(like);
                        });
    }

    @Transactional(readOnly = true)
    public long getLikeCount(UUID blogId) {

        BlogPost blog = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new EntityNotFoundException("Blog not found"));

        return likeRepository.countByBlog(blog);
    }

    @Transactional(readOnly = true)
    public boolean isLikedByCurrentUser(UUID blogId) {

        try {
            User user = getCurrentUser();

            BlogPost blog = blogPostRepository.findById(blogId)
                    .orElseThrow();

            return likeRepository.existsByUserAndBlog(user, blog);
        } catch (Exception e) {
            return false;
        }
    }
}
