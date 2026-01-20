package com.Blog.Platform.AiService.Client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Component
public class GeminiClient {

        private final WebClient webClient;

        public GeminiClient(WebClient webClient) {
                this.webClient = webClient;
        }

        @Value("${gemini.api.key}")
        private String apiKey;

        @Value("${gemini.api.base-url}")
        private String apiUrl;

        public String call(String prompt) {

                Map<String, Object> body = Map.of(
                                "contents", List.of(
                                                Map.of(
                                                                "parts", List.of(
                                                                                Map.of("text", prompt)))));

                try {
                        Map response = webClient.post()
                                        .uri(apiUrl + "?key=" + apiKey)
                                        .header("Content-Type", "application/json")
                                        .bodyValue(body)
                                        .retrieve()
                                        .bodyToMono(Map.class)
                                        .block();

                        return extractText(response);

                } catch (WebClientResponseException e) {
                        throw new RuntimeException(
                                        "Gemini AI error " + e.getStatusCode() + ": " + e.getResponseBodyAsString(),
                                        e);
                } catch (Exception e) {
                        throw new RuntimeException("Failed to connect to Gemini AI service", e);
                }
        }

        @SuppressWarnings("unchecked")
        private String extractText(Map<String, Object> response) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");

                if (candidates == null || candidates.isEmpty()) {
                        return "No AI response";
                }

                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");

                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

                return parts.get(0).get("text").toString();
        }
}
