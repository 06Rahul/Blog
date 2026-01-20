package com.Blog.Platform.AiService.DTO;

public class AiRequest {
    private String content;
    private String tone;
    private String maxLength;

    public AiRequest() {
    }

    public AiRequest(String content, String tone, String maxLength) {
        this.content = content;
        this.tone = tone;
        this.maxLength = maxLength;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getMaxLength() {
        return maxLength;
    }

    public void setMaxLength(String maxLength) {
        this.maxLength = maxLength;
    }
}
