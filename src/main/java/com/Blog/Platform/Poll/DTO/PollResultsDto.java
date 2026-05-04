package com.Blog.Platform.Poll.DTO;

import lombok.Data;
import java.util.List;

@Data
public class PollResultsDto {
    private String question;
    private List<PollOptionDto> options;
    private Integer totalVotes;
    private String userVotedOptionId;
    private Boolean closed;
}
