package com.Blog.Platform.Blog.Mapper;

import com.Blog.Platform.Blog.DTO.CommentResponse;
import com.Blog.Platform.Blog.Model.Comment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getAuthor().getId(),
                comment.getAuthor().getActualUsername(),
                comment.getAuthor().getProfileImageUrl(),
                comment.getCreatedAt());
    }
}
