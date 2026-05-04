package com.Blog.Platform.Poll.DTO;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PollCreateRequest {
    private String question;
    private List<String> options;
    private LocalDateTime endsAt;
}
