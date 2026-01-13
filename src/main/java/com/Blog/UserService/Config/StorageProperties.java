package com.Blog.UserService.Config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration @Data
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {
    private String imageDir;
}
