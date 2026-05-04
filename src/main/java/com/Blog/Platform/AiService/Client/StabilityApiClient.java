package com.Blog.Platform.AiService.Client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class StabilityApiClient {

    private final WebClient webClient;
    private final String apiKey;

    public StabilityApiClient(WebClient.Builder webClientBuilder,
                              @Value("${stability.api.key:dummy}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl("https://api.stability.ai/v1/generation/stable-diffusion-v1-6").build();
        this.apiKey = apiKey;
    }

    @SuppressWarnings("unchecked")
    public String generateImage(String prompt) {
        if ("dummy".equals(apiKey)) {
            log.warn("Stability API key not set. Returning dummy thumbnail URL.");
            return "https://dummyimage.com/512x512/000/fff&text=AI+Thumbnail";
        }

        try {
            Map<String, Object> response = webClient.post()
                    .uri("/text-to-image")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "text_prompts", List.of(Map.of("text", prompt)),
                            "cfg_scale", 7,
                            "height", 512,
                            "width", 512,
                            "samples", 1,
                            "steps", 30
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("artifacts")) {
                List<Map<String, Object>> artifacts = (List<Map<String, Object>>) response.get("artifacts");
                if (!artifacts.isEmpty()) {
                    return "data:image/png;base64," + artifacts.get(0).get("base64");
                }
            }
        } catch (Exception e) {
            log.error("Failed to generate thumbnail: {}", e.getMessage());
        }
        return null;
    }
}
