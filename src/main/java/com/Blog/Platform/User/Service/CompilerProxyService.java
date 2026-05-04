package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.DTO.CompilerExecuteRequest;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class CompilerProxyService {

    private static final String PISTON_BASE_URL = "https://emkc.org/api/v2/piston";

    private final WebClient webClient;

    public CompilerProxyService(WebClient webClient) {
        this.webClient = webClient;
    }

    public List<Map<String, Object>> getRuntimes() {
        return webClient.get()
                .uri(PISTON_BASE_URL + "/runtimes")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToFlux(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .collectList()
                .blockOptional()
                .orElse(List.of());
    }

    public Map<String, Object> execute(CompilerExecuteRequest request) {
        String extension = resolveExtension(request.getLanguage());

        Map<String, Object> payload = Map.of(
                "language", request.getLanguage(),
                "version", request.getVersion(),
                "files", List.of(Map.of(
                        "name", "main." + extension,
                        "content", request.getCode()
                ))
        );

        try {
            return webClient.post()
                    .uri(PISTON_BASE_URL + "/execute")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("User-Agent", "BlogPlatform/1.0")
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                    .blockOptional()
                    .orElse(Map.of("run", Map.of("output", "No response from Piston API")));
        } catch (Exception e) {
            return Map.of("run", Map.of("output", "Compiler Error: " + e.getMessage()));
        }
    }

    private String resolveExtension(String language) {
        if (language == null) {
            return "txt";
        }

        return switch (language) {
            case "python" -> "py";
            case "javascript" -> "js";
            case "typescript" -> "ts";
            case "java" -> "java";
            case "cpp", "c++" -> "cpp";
            case "c" -> "c";
            case "go" -> "go";
            case "rust" -> "rs";
            case "php" -> "php";
            case "ruby" -> "rb";
            case "csharp" -> "cs";
            case "swift" -> "swift";
            case "kotlin" -> "kt";
            default -> "txt";
        };
    }
}
