package com.Blog.Platform.AiService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AiUsageResponse {
    private int used;
    private int limit;
    private int remaining;
}
