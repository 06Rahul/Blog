package com.Blog.Platform.Community.Repository;

import com.Blog.Platform.Community.Model.Community;
import com.Blog.Platform.Community.Model.DiscussionThread;
import com.Blog.Platform.User.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DiscussionThreadRepository extends JpaRepository<DiscussionThread, UUID> {

    Page<DiscussionThread> findByCommunity(Community community, Pageable pageable);

    Page<DiscussionThread> findByAuthor(User author, Pageable pageable);

    java.util.List<DiscussionThread> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String title,
            String content);
}
