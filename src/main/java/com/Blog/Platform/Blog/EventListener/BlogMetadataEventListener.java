package com.Blog.Platform.Blog.EventListener;

import com.Blog.Platform.Blog.Event.BlogPublishedEvent;
import com.Blog.Platform.Blog.ServiceImpl.BlogMetadataService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class BlogMetadataEventListener {

    private final BlogMetadataService blogMetadataService;

    public BlogMetadataEventListener(BlogMetadataService blogMetadataService) {
        this.blogMetadataService = blogMetadataService;
    }

    @Async
    @EventListener
    public void onPublish(BlogPublishedEvent e) {
        blogMetadataService.indexBlogKeywords(e.getPost());
    }
}
