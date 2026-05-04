package com.Blog.Platform.Poll.Repo;

import com.Blog.Platform.Poll.Model.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, UUID> {
    boolean existsByPollIdAndUserId(UUID pollId, UUID userId);
    List<PollVote> findByPollId(UUID pollId);
    Optional<PollVote> findByPollIdAndUserId(UUID pollId, UUID userId);
    int countByOptionId(UUID optionId);
}
