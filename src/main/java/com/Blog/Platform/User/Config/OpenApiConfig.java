package com.Blog.Platform.User.Config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI userServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Blog Platform API")
                        .description("REST API documentation for the Blog Platform (User, Blog, and AI services).")
                        .version("v1"));
    }
}

