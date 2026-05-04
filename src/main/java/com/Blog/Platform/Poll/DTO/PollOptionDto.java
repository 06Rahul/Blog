package com.Blog.Platform.Poll.DTO;

import lombok.Data;

@Data
public class PollOptionDto {
    private String id;
    private String optionText;
    private Integer votes;
    private Double percentage;
}
