package com.Blog.Platform.User.Controller;

import com.Blog.Platform.Community.DTO.CommunityDTO;
import com.Blog.Platform.Community.DTO.ThreadDTO;
import com.Blog.Platform.User.DTO.SearchSuggestionResponse;
import com.Blog.Platform.Community.Repository.CommunityRepository;
import com.Blog.Platform.Community.Repository.DiscussionThreadRepository;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private DiscussionThreadRepository threadRepository;

    @Autowired
    private com.Blog.Platform.Blog.Repo.BlogPostRepository blogPostRepository;

    @Autowired
    private com.Blog.Platform.User.Repo.UserRepo userRepo;

    @Autowired
    private com.Blog.Platform.Blog.Mapper.BlogPostMapper blogPostMapper;

    @Autowired
    private com.Blog.Platform.User.UserMapper.UserMapper userMapper;

    @Autowired
    private com.Blog.Platform.Community.Repository.CommunityMemberRepository communityMemberRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private com.Blog.Platform.Blog.Service.TrendingTagService trendingTagService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(@RequestParam String query,
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> result = new HashMap<>();
        User currentUser = userDetails != null ? userService.getCurrentUser() : null;
        int safeLimit = Math.min(Math.max(limit, 1), 25);

        // Search Communities
        List<CommunityDTO> communities = communityRepository
                .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query)
                .stream()
                .limit(safeLimit)
                .map(c -> {
                    CommunityDTO dto = new CommunityDTO();
                    dto.setId(c.getId());
                    dto.setName(c.getName());
                    dto.setDescription(c.getDescription());
                    return dto;
                })
                .collect(Collectors.toList());

        // Search Threads
        List<ThreadDTO> threads = threadRepository
                .findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(query, query)
                .stream()
                .limit(safeLimit)
                .map(t -> {
                    ThreadDTO dto = new ThreadDTO();
                    dto.setId(t.getId());
                    dto.setTitle(t.getTitle());
                    dto.setCommunityName(t.getCommunity().getName());
                    dto.setAuthorName(t.getAuthor().getActualUsername());
                    return dto;
                })
                .collect(Collectors.toList());

        // Search Blogs
        List<com.Blog.Platform.Blog.DTO.BlogPostResponse> blogs = blogPostRepository
                .searchEverywhere(query, null, PageRequest.of(0, safeLimit))
                .stream()
                .filter(blog -> !blog.isCommunityExclusive()
                        || (currentUser != null && (blog.getAuthor().getId().equals(currentUser.getId())
                                || (blog.getCommunity() != null
                                        && communityMemberRepository.existsByCommunityIdAndUserId(
                                                blog.getCommunity().getId(),
                                                currentUser.getId())))))
                .map(blogPostMapper::toResponse)
                .collect(Collectors.toList());

        // Search Users
        List<com.Blog.Platform.User.DTO.UserDTO> users = userRepo
                .findByUsernameContainingIgnoreCase(query)
                .stream()
                .limit(safeLimit)
                .map(u -> new com.Blog.Platform.User.DTO.UserDTO(u.getId(), u.getActualUsername(),
                        u.getProfileImageUrl()))
                .collect(Collectors.toList());

        result.put("communities", communities);
        result.put("threads", threads);
        result.put("blogs", blogs);
        result.put("users", users);
        result.put("query", query);
        result.put("total", communities.size() + threads.size() + blogs.size() + users.size());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<SearchSuggestionResponse>> getSuggestions(
            @RequestParam String query,
            @RequestParam(defaultValue = "8") int limit
    ) {
        String normalized = query == null ? "" : query.trim();
        if (normalized.isBlank()) {
            return ResponseEntity.ok(List.of());
        }

        int safeLimit = Math.min(Math.max(limit, 1), 12);
        List<SearchSuggestionResponse> suggestions = new java.util.ArrayList<>();

        communityRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(normalized, normalized)
                .stream()
                .limit(Math.max(2, safeLimit / 3))
                .forEach(community -> suggestions.add(new SearchSuggestionResponse(
                        "community",
                        community.getName(),
                        community.getDescription() == null ? "Community" : community.getDescription(),
                        "/communities/" + community.getId()
                )));

        userRepo.findByUsernameContainingIgnoreCase(normalized)
                .stream()
                .limit(Math.max(2, safeLimit / 3))
                .forEach(user -> suggestions.add(new SearchSuggestionResponse(
                        "user",
                        "@" + user.getActualUsername(),
                        java.util.stream.Stream.of(user.getFirstName(), user.getLastName())
                                .filter(java.util.Objects::nonNull)
                                .filter(name -> !name.isBlank())
                                .collect(java.util.stream.Collectors.joining(" ")),
                        "/profile/" + user.getActualUsername()
                )));

        trendingTagService.autocompleteTags(normalized, Math.max(2, safeLimit / 3))
                .forEach(tag -> suggestions.add(new SearchSuggestionResponse(
                        "tag",
                        "#" + tag.getTagName(),
                        tag.getViews24h() + " recent views",
                        "/search?q=" + java.net.URLEncoder.encode(tag.getTagName(), java.nio.charset.StandardCharsets.UTF_8)
                )));

        blogPostRepository.searchEverywhere(normalized, null, PageRequest.of(0, Math.max(2, safeLimit / 3)))
                .stream()
                .limit(Math.max(2, safeLimit / 3))
                .forEach(blog -> suggestions.add(new SearchSuggestionResponse(
                        "post",
                        blog.getTitle(),
                        blog.getAuthor().getActualUsername(),
                        "/blogs/" + blog.getId()
                )));

        List<SearchSuggestionResponse> deduped = suggestions.stream()
                .collect(Collectors.toMap(
                        suggestion -> suggestion.type() + ":" + suggestion.label().toLowerCase(),
                        suggestion -> suggestion,
                        (left, right) -> left,
                        java.util.LinkedHashMap::new
                ))
                .values()
                .stream()
                .limit(safeLimit)
                .toList();

        return ResponseEntity.ok(deduped);
    }
}
