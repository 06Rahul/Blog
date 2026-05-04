package com.Blog.Platform.Poll.Service;

import com.Blog.Platform.Poll.DTO.PollCreateRequest;
import com.Blog.Platform.Poll.DTO.PollResultsDto;
import com.Blog.Platform.Poll.DTO.PollVoteRequest;

import java.util.UUID;

public interface PollService {
    UUID createPoll(PollCreateRequest request);
    PollResultsDto vote(UUID pollId, PollVoteRequest request, UUID userId);
    PollResultsDto getResults(UUID pollId, UUID userId);
}
