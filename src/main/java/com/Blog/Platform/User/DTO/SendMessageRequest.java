package com.Blog.Platform.User.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class SendMessageRequest {
    
    @NotBlank(message = "Message content cannot be blank")
    private String content;
    
    private String mediaUrl;
    
    private String messageType = "TEXT";

    public SendMessageRequest() {}

    public SendMessageRequest(String content, String mediaUrl, String messageType) {
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.messageType = messageType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }
}
