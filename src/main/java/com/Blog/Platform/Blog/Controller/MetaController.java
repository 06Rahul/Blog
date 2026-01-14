package com.Blog.Platform.Blog.Controller;

import com.Blog.Platform.Blog.Model.Category;
import com.Blog.Platform.Blog.Model.Tag;
import com.Blog.Platform.Blog.Repo.CategoryRepository;
import com.Blog.Platform.Blog.Repo.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/meta")
@RequiredArgsConstructor
public class MetaController {

    private final CategoryRepository categoryRepo;
    private final TagRepository tagRepo;

    @GetMapping("/categories")
    public List<Category> categories() {
        return categoryRepo.findAll();
    }

    @GetMapping("/tags")
    public List<Tag> tags() {
        return tagRepo.findAll();
    }
}
