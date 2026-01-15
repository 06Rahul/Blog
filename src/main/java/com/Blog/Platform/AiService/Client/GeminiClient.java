package com.Blog.Platform.AiService.Client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final WebClient webClient;

    @Value("${ai.gemini.api-key}")
    private String apiKey;

    @Value("${ai.gemini.url}")
    private String apiUrl;

    public String call(String prompt) {

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        try {
            return webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path(apiUrl)
                            .queryParam("key", apiKey)
                            .build()
                    )
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .map(this::extractText)
                    .block();

        } catch (WebClientResponseException ex) {

            // 🔥 Gemini rate limit / quota exceeded
            if (ex.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                throw new RuntimeException(
                        "AI quota exceeded. Please try again later."
                );
            }

            // 🔥 Any other Gemini error
            throw new RuntimeException(
                    "Gemini API error: " + ex.getResponseBodyAsString()
            );

        } catch (Exception ex) {
            throw new RuntimeException(
                    "Failed to connect to Gemini AI service"
            );
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {

        List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) response.get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            return "No response from Gemini";
        }

        Map<String, Object> content =
                (Map<String, Object>) candidates.get(0).get("content");

        List<Map<String, Object>> parts =
                (List<Map<String, Object>>) content.get("parts");

        return parts.get(0).get("text").toString();
    }
}
