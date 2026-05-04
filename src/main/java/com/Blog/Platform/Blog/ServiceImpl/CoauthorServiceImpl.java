package com.Blog.Platform.Blog.ServiceImpl;

import com.Blog.Platform.Blog.Exception.ResourceNotFoundException;
import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Model.CoauthorStatus;
import com.Blog.Platform.Blog.Model.PostCoauthor;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Repository.PostCoauthorRepository;
import com.Blog.Platform.Blog.Service.CoauthorService;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import com.Blog.Platform.User.Service.NotificationService;
import com.Blog.Platform.User.Utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CoauthorServiceImpl implements CoauthorService {

    private final PostCoauthorRepository coauthorRepository;
    private final BlogPostRepository blogPostRepository;
    private final UserRepo userRepository;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void invite(UUID blogId, UUID invitedUserId, UUID invitingUserId) {
        BlogPost post = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
                
        if (!post.getAuthor().getId().equals(invitingUserId)) {
            throw new IllegalArgumentException("Only the post owner can invite co-authors.");
        }

        if (coauthorRepository.existsByBlogIdAndSubjectUserId(blogId, invitedUserId)) {
            throw new IllegalArgumentException("User is already a coauthor or invited.");
        }

        User invitedUser = userRepository.findById(invitedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Invited user not found"));
                
        User invitingUser = userRepository.findById(invitingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Inviting user not found"));

        PostCoauthor coauthor = new PostCoauthor();
        coauthor.setBlog(post);
        coauthor.setSubjectUser(invitedUser);
        coauthor.setInvitedBy(invitingUser);
        coauthor.setStatus(CoauthorStatus.PENDING);
        
        PostCoauthor saved = coauthorRepository.save(coauthor);
        
        String token = jwtUtil.generateCoauthorToken(saved.getId().toString());
        notificationService.notifyCoauthorInvite(invitedUser, invitingUser, post.getTitle(), token);
    }

    @Override
    @Transactional
    public void accept(String token) {
        if (!jwtUtil.isCoauthorToken(token)) {
            throw new IllegalArgumentException("Invalid invitation token.");
        }
        
        UUID coauthorId = UUID.fromString(jwtUtil.extractUsername(token));
        PostCoauthor coauthor = coauthorRepository.findById(coauthorId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found."));
                
        coauthor.setStatus(CoauthorStatus.ACCEPTED);
        coauthor.setRespondedAt(LocalDateTime.now());
        coauthorRepository.save(coauthor);
        
        notificationService.notifyCoauthorAccept(coauthor.getBlog().getAuthor(), coauthor.getSubjectUser(), coauthor.getBlog().getTitle());
    }

    @Override
    @Transactional
    public void decline(String token) {
        if (!jwtUtil.isCoauthorToken(token)) {
            throw new IllegalArgumentException("Invalid invitation token.");
        }
        
        UUID coauthorId = UUID.fromString(jwtUtil.extractUsername(token));
        PostCoauthor coauthor = coauthorRepository.findById(coauthorId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found."));
                
        coauthor.setStatus(CoauthorStatus.DECLINED);
        coauthor.setRespondedAt(LocalDateTime.now());
        coauthorRepository.save(coauthor);
    }

    @Override
    @Transactional
    public void remove(UUID blogId, UUID userId, UUID requestingUserId) {
        BlogPost post = blogPostRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
                
        if (!post.getAuthor().getId().equals(requestingUserId)) {
            throw new IllegalArgumentException("Only the post owner can remove co-authors.");
        }
        
        coauthorRepository.deleteByBlogIdAndSubjectUserId(blogId, userId);
    }
}
