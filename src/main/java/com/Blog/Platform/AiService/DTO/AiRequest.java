package com.Blog.Platform.AiService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class AiRequest {
    private String content;
    private String tone;
    private  String maxLength;
}
