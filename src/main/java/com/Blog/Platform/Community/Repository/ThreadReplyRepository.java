package com.Blog.Platform.Community.Repository;

import com.Blog.Platform.Community.Model.DiscussionThread;
import com.Blog.Platform.Community.Model.ThreadReply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ThreadReplyRepository extends JpaRepository<ThreadReply, UUID> {

    Page<ThreadReply> findByThreadAndParentIsNull(DiscussionThread thread, Pageable pageable);

    Page<ThreadReply> findByParent(ThreadReply parent, Pageable pageable);
}
