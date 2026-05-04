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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class EngagementService {

    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final BlogPostRepository blogPostRepository;
    private final UserRepo userRepo;
    private final CommentMapper commentMapper;
    private final com.Blog.Platform.AiService.Service.AiService aiService;
    private final com.Blog.Platform.User.Service.NotificationService notificationService;
    private final com.Blog.Platform.User.Service.VirtualKudosService kudosService;
    private final com.Blog.Platform.Blog.Service.RelevanceFeedService relevanceFeedService;
    private final com.Blog.Platform.User.Service.BlockService blockService;
    private final com.Blog.Platform.Blog.Repo.CommentLikeRepository commentLikeRepository;

    public EngagementService(CommentRepository commentRepository, LikeRepository likeRepository,
            BlogPostRepository blogPostRepository, UserRepo userRepo, CommentMapper commentMapper,
            com.Blog.Platform.AiService.Service.AiService aiService,
            com.Blog.Platform.User.Service.NotificationService notificationService,
            com.Blog.Platform.User.Service.VirtualKudosService kudosService,
            com.Blog.Platform.Blog.Service.RelevanceFeedService relevanceFeedService,
            com.Blog.Platform.User.Service.BlockService blockService,
            com.Blog.Platform.Blog.Repo.CommentLikeRepository commentLikeRepository) {
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.blogPostRepository = blogPostRepository;
        this.userRepo = userRepo;
        this.commentMapper = commentMapper;
        this.aiService = aiService;
        this.notificationService = notificationService;
        this.kudosService = kudosService;
        this.relevanceFeedService = relevanceFeedService;
        this.blockService = blockService;
        this.commentLikeRepository = commentLikeRepository;
    }

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

        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent comment not found"));
            comment.setParent(parent);
        }

        var moderationResult = aiService.moderateContent(request.getContent());
        if (!moderationResult.safe()) {
            comment.setModerationStatus(com.Blog.Platform.AiService.Model.ModerationStatus.REJECTED);
            comment.setModerationReason(moderationResult.reason());
            commentRepository.save(comment);
            notificationService.notifyModerationRejection(author, moderationResult.reason());
            throw new com.Blog.Platform.AiService.Exception.ContentModerationException(moderationResult.reason());
        }
        comment.setModerationStatus(com.Blog.Platform.AiService.Model.ModerationStatus.APPROVED);

        Comment saved = commentRepository.save(comment);
        
        // Award points for comment
        kudosService.awardPoints(
                author.getId(), 
                blogId, 
                com.Blog.Platform.User.Model.TransactionType.EARN_COMMENT, 
                2, 
                saved.getId().toString()
        );

        relevanceFeedService.recordAffinity(author.getId(), blog.getTags(), 3.0f);
        
        return commentMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getComments(UUID blogId, Pageable pageable) {
        User user = null;
        try {
            user = getCurrentUser();
        } catch(Exception e) {}

        var page = commentRepository
                .findByBlog_IdAndParentIsNullOrderByCreatedAtDesc(blogId, pageable);

        if (user != null) {
            final UUID currentId = user.getId();
            java.util.List<CommentResponse> filtered = page.getContent().stream()
                .filter(c -> !blockService.isBlocked(currentId, c.getAuthor().getId()))
                .map(commentMapper::toResponse)
                .toList();
            return new org.springframework.data.domain.PageImpl<>(filtered, pageable, page.getTotalElements());
        }

        return page.map(commentMapper::toResponse);
    }
    
    public CommentResponse editComment(UUID commentId, String content) {
        User user = getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized to edit this comment");
        }
        
        comment.setContent(content);
        Comment saved = commentRepository.save(comment);
        return commentMapper.toResponse(saved);
    }

    public void deleteComment(UUID commentId) {
        User user = getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
                
        if (!comment.getAuthor().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new IllegalArgumentException("Not authorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }

    public void toggleCommentLike(UUID commentId) {
        User user = getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        commentLikeRepository.findByUserAndComment(user, comment)
                .ifPresentOrElse(
                        commentLikeRepository::delete,
                        () -> {
                            com.Blog.Platform.Blog.Model.CommentLike like = new com.Blog.Platform.Blog.Model.CommentLike();
                            like.setUser(user);
                            like.setComment(comment);
                            commentLikeRepository.save(like);
                            if (!user.getId().equals(comment.getAuthor().getId())) {
                                String actorName = user.getFirstName() != null ? user.getFirstName() : user.getActualUsername();
                                notificationService.createNotification(
                                        comment.getAuthor(),
                                        user,
                                        com.Blog.Platform.User.Model.NotificationType.LIKE,
                                        comment.getBlog().getId().toString(),
                                        actorName + " liked your comment"
                                );
                            }
                        });
    }

    @Transactional(readOnly = true)
    public long getCommentLikeCount(UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        return commentLikeRepository.countByComment(comment);
    }
    
    @Transactional(readOnly = true)
    public boolean isCommentLikedByCurrentUser(UUID commentId) {
        try {
            User user = getCurrentUser();
            Comment comment = commentRepository.findById(commentId).orElseThrow();
            return commentLikeRepository.existsByUserAndComment(user, comment);
        } catch (Exception e) {
            return false;
        }
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
                            relevanceFeedService.recordAffinity(user.getId(), blog.getTags(), 2.0f);
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
    
    @Transactional(readOnly = true)
    public java.util.List<com.Blog.Platform.User.DTO.PublicUserProfileResponse> getBlogLikers(UUID blogId) {
        BlogPost blog = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new EntityNotFoundException("Blog not found"));
                
        return likeRepository.findByBlog(blog).stream()
                .map(Like::getUser)
                .map(u -> com.Blog.Platform.User.DTO.PublicUserProfileResponse.builder()
                        .id(u.getId())
                        .username(u.getActualUsername())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .profileImageUrl(u.getProfileImageUrl())
                        .build())
                .toList();
    }
}
