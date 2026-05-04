package com.Blog.Platform.User.Config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.awt.Desktop;
import java.awt.GraphicsEnvironment;
import java.net.URI;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Component
@RequiredArgsConstructor
public class SwaggerUiAutoOpen {

    private final Environment environment;
    private final AtomicBoolean opened = new AtomicBoolean(false);

    @EventListener(ApplicationReadyEvent.class)
    public void openSwaggerUi() {
        if (!isEnabled() || !opened.compareAndSet(false, true)) {
            return;
        }

        if (GraphicsEnvironment.isHeadless()) {
            log.info("Swagger UI auto-open is enabled, but app is running headless. URL: {}", buildSwaggerUrl());
            return;
        }

        if (!Desktop.isDesktopSupported() || !Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
            log.info("Swagger UI auto-open is enabled, but Desktop browse is not supported. URL: {}", buildSwaggerUrl());
            return;
        }

        String url = buildSwaggerUrl();
        try {
            Desktop.getDesktop().browse(URI.create(url));
            log.info("Opened Swagger UI: {}", url);
        } catch (Exception e) {
            log.warn("Failed to auto-open Swagger UI ({}). You can open it manually.", url, e);
        }
    }

    private boolean isEnabled() {
        return Boolean.parseBoolean(environment.getProperty("app.swagger.auto-open", "false"));
    }

    private String buildSwaggerUrl() {
        String scheme = Boolean.parseBoolean(environment.getProperty("server.ssl.enabled", "false")) ? "https" : "http";
        String host = environment.getProperty("server.address", "localhost");
        int port = Integer.parseInt(environment.getProperty(
                "local.server.port",
                environment.getProperty("server.port", "8080")
        ));

        String contextPath = environment.getProperty("server.servlet.context-path", "");
        if (!contextPath.isBlank() && !contextPath.startsWith("/")) {
            contextPath = "/" + contextPath;
        }

        String uiPath = environment.getProperty("springdoc.swagger-ui.path");
        if (uiPath == null || uiPath.isBlank()) {
            uiPath = environment.getProperty("app.swagger.ui-path", "/swagger-ui/index.html");
        }
        if (!uiPath.startsWith("/")) {
            uiPath = "/" + uiPath;
        }

        return scheme + "://" + host + ":" + port + contextPath + uiPath;
    }
}
