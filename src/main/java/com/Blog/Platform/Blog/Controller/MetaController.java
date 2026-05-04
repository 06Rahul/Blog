package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.Blog.Model.Category;
import com.Blog.Platform.Blog.Model.Tag;
import com.Blog.Platform.Blog.Repo.CategoryRepository;
import com.Blog.Platform.Blog.Repo.TagRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/meta")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Meta", description = "Metadata endpoints (categories, tags).")
public class MetaController {

    private final CategoryRepository categoryRepo;
    private final TagRepository tagRepo;

    @GetMapping("/categories")
    @Operation(summary = "List categories", description = "Returns all blog categories.")
    public List<Category> categories() {
        return categoryRepo.findAll();
    }

    @GetMapping("/tags")
    @Operation(summary = "List tags", description = "Returns all blog tags.")
    public List<Tag> tags() {
        return tagRepo.findAll();
    }
}
