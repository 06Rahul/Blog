package com.Blog.Platform.User.Controller;

import com.Blog.Platform.Community.DTO.CommunityDTO;
import com.Blog.Platform.Community.DTO.ThreadDTO;
import com.Blog.Platform.Community.Repository.CommunityRepository;
import com.Blog.Platform.Community.Repository.DiscussionThreadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(@RequestParam String query) {
        Map<String, Object> result = new HashMap<>();

        // Search Communities
        List<CommunityDTO> communities = communityRepository
                .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query)
                .stream()
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
        // We use pageable to limit results, e.g. top 10
        List<com.Blog.Platform.Blog.DTO.BlogPostResponse> blogs = blogPostRepository
                .searchEverywhere(query, null, org.springframework.data.domain.PageRequest.of(0, 10))
                .stream()
                .map(blogPostMapper::toResponse)
                .collect(Collectors.toList());

        // Search Users
        List<com.Blog.Platform.User.DTO.UserDTO> users = userRepo
                .findByUsernameContainingIgnoreCase(query)
                .stream()
                .map(u -> new com.Blog.Platform.User.DTO.UserDTO(u.getId(), u.getActualUsername(),
                        u.getProfileImageUrl()))
                .collect(Collectors.toList());

        result.put("communities", communities);
        result.put("threads", threads);
        result.put("blogs", blogs);
        result.put("users", users);

        return ResponseEntity.ok(result);
    }
}
