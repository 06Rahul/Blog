package com.Blog.Platform.AiService.Client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public String call(String prompt) {
        GeminiRequest requestBody = new GeminiRequest(
                List.of(new Content(List.of(new Part(prompt))))
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
                    .bodyToMono(GeminiResponse.class)
                    .flatMap(this::extractText)
                    .block();

        } catch (WebClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                throw new RuntimeException("AI quota exceeded. Please try again later.");
            }

            throw new RuntimeException("Gemini API error: " + ex.getResponseBodyAsString());

        } catch (Exception ex) {
            throw new RuntimeException("Failed to connect to Gemini AI service");
        }
    }

    private Mono<String> extractText(GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return Mono.just("No response from Gemini");
        }

        Candidate candidate = response.candidates().get(0);
        if (candidate.content() == null
                || candidate.content().parts() == null
                || candidate.content().parts().isEmpty()
                || candidate.content().parts().get(0).text() == null) {
            return Mono.just("No response from Gemini");
        }

        return Mono.just(candidate.content().parts().get(0).text());
    }

    private record GeminiRequest(List<Content> contents) {}

    private record GeminiResponse(List<Candidate> candidates) {}

    private record Candidate(Content content) {}

    private record Content(List<Part> parts) {}

    private record Part(String text) {}
}
