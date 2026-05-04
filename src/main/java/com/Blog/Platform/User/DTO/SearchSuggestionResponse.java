package com.Blog.Platform.User.DTO;

public record SearchSuggestionResponse(
        String type,
        String label,
        String subtitle,
        String routeUrl
) {
}
