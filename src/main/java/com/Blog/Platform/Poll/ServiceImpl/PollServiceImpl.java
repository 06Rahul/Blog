package com.Blog.Platform.Poll.ServiceImpl;

import com.Blog.Platform.Poll.DTO.PollCreateRequest;
import com.Blog.Platform.Poll.DTO.PollOptionDto;
import com.Blog.Platform.Poll.DTO.PollResultsDto;
import com.Blog.Platform.Poll.DTO.PollVoteRequest;
import com.Blog.Platform.Poll.Model.Poll;
import com.Blog.Platform.Poll.Model.PollOption;
import com.Blog.Platform.Poll.Model.PollVote;
import com.Blog.Platform.Poll.Repo.PollOptionRepository;
import com.Blog.Platform.Poll.Repo.PollRepository;
import com.Blog.Platform.Poll.Repo.PollVoteRepository;
import com.Blog.Platform.Poll.Service.PollService;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PollServiceImpl implements PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollVoteRepository pollVoteRepository;
    private final UserRepo userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public UUID createPoll(PollCreateRequest request) {
        Poll poll = new Poll();
        poll.setQuestion(request.getQuestion());
        poll.setEndsAt(request.getEndsAt());
        
        List<PollOption> options = new ArrayList<>();
        int order = 1;
        for (String optText : request.getOptions()) {
            PollOption option = new PollOption();
            option.setPoll(poll);
            option.setOptionText(optText);
            option.setDisplayOrder(order++);
            options.add(option);
        }
        poll.setOptions(options);
        
        return pollRepository.save(poll).getId();
    }

    @Override
    @Transactional
    public PollResultsDto vote(UUID pollId, PollVoteRequest request, UUID userId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Poll not found"));

        if (poll.getEndsAt() != null && poll.getEndsAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Poll is already closed");
        }

        if (pollVoteRepository.existsByPollIdAndUserId(pollId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already voted on this poll");
        }

        PollOption option = pollOptionRepository.findById(UUID.fromString(request.getOptionId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Option not found"));

        if (!option.getPoll().getId().equals(pollId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Option does not belong to this poll");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        PollVote vote = new PollVote(poll, option, user);
        pollVoteRepository.save(vote);

        PollResultsDto results = getResults(pollId, userId);
        
        // Broadcast results
        messagingTemplate.convertAndSend("/topic/polls/" + pollId, results);

        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public PollResultsDto getResults(UUID pollId, UUID userId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Poll not found"));

        boolean isEnded = poll.getEndsAt() != null && poll.getEndsAt().isBefore(LocalDateTime.now());
        boolean hasVoted = false;
        String userVotedOptionId = null;

        if (userId != null) {
            Optional<PollVote> vote = pollVoteRepository.findByPollIdAndUserId(pollId, userId);
            if (vote.isPresent()) {
                hasVoted = true;
                userVotedOptionId = vote.get().getOption().getId().toString();
            }
        }

        boolean showFullResults = isEnded || hasVoted;

        int totalVotes = 0;
        Map<UUID, Integer> optionVoteCounts = new HashMap<>();
        for (PollOption opt : poll.getOptions()) {
            int count = pollVoteRepository.countByOptionId(opt.getId());
            optionVoteCounts.put(opt.getId(), count);
            totalVotes += count;
        }

        PollResultsDto dto = new PollResultsDto();
        dto.setQuestion(poll.getQuestion());
        dto.setTotalVotes(showFullResults ? totalVotes : 0);
        dto.setClosed(isEnded);
        dto.setUserVotedOptionId(userVotedOptionId);

        List<PollOptionDto> optionDtos = new ArrayList<>();
        
        // sort options by display order
        poll.getOptions().sort(Comparator.comparing(PollOption::getDisplayOrder));
        
        for (PollOption opt : poll.getOptions()) {
            PollOptionDto optDto = new PollOptionDto();
            optDto.setId(opt.getId().toString());
            optDto.setOptionText(opt.getOptionText());
            
            if (showFullResults) {
                int votes = optionVoteCounts.get(opt.getId());
                double percentage = totalVotes == 0 ? 0 : ((double) votes / totalVotes) * 100.0;
                optDto.setVotes(votes);
                optDto.setPercentage(percentage);
            } else {
                optDto.setVotes(null);
                optDto.setPercentage(null);
            }
            optionDtos.add(optDto);
        }
        dto.setOptions(optionDtos);
        
        return dto;
    }
}
