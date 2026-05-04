package com.Blog.Platform.User.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final StorageProperties storageProperties;

    public WebConfig(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    @Override
    public void addResourceHandlers(@SuppressWarnings("null") ResourceHandlerRegistry registry) {
        String imageDir = storageProperties.getImageDir();
        Path uploadDir = Paths.get(imageDir);
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        if (imageDir.startsWith("./")) {
            uploadPath = System.getProperty("user.dir") + imageDir.substring(1);
        }

        registry.addResourceHandler("/api/images/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
