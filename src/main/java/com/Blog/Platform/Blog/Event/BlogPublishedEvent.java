package com.Blog.Platform.Blog.Event;

import com.Blog.Platform.Blog.Model.BlogPost;
import org.springframework.context.ApplicationEvent;

public class BlogPublishedEvent extends ApplicationEvent {
    private final BlogPost post;

    public BlogPublishedEvent(Object source, BlogPost post) {
        super(source);
        this.post = post;
    }

    public BlogPost getPost() {
        return post;
    }
}
