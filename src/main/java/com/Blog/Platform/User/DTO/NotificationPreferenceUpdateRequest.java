package com.Blog.Platform.User.DTO;

public class NotificationPreferenceUpdateRequest {
    private Boolean likes;
    private Boolean comments;
    private Boolean follows;
    private Boolean mentions;
    private Boolean messages;
    private Boolean community;

    public Boolean getLikes() {
        return likes;
    }

    public void setLikes(Boolean likes) {
        this.likes = likes;
    }

    public Boolean getComments() {
        return comments;
    }

    public void setComments(Boolean comments) {
        this.comments = comments;
    }

    public Boolean getFollows() {
        return follows;
    }

    public void setFollows(Boolean follows) {
        this.follows = follows;
    }

    public Boolean getMentions() {
        return mentions;
    }

    public void setMentions(Boolean mentions) {
        this.mentions = mentions;
    }

    public Boolean getMessages() {
        return messages;
    }

    public void setMessages(Boolean messages) {
        this.messages = messages;
    }

    public Boolean getCommunity() {
        return community;
    }

    public void setCommunity(Boolean community) {
        this.community = community;
    }
}
