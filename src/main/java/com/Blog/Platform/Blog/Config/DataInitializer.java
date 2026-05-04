package com.Blog.Platform.Blog.Config;

import com.Blog.Platform.Blog.Model.Category;
import com.Blog.Platform.Blog.Repo.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final com.Blog.Platform.Blog.Repo.TagRepository tagRepository;

    public DataInitializer(CategoryRepository categoryRepository, com.Blog.Platform.Blog.Repo.TagRepository tagRepository) {
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize categories if they don't exist
        List<String> categoryNames = Arrays.asList(
            "Education", "Tech", "Travel", "Business", "Health", "Lifestyle"
        );
        for (String name : categoryNames) {
            if (!categoryRepository.existsByName(name)) {
                Category category = new Category();
                category.setName(name);
                categoryRepository.save(category);
            }
        }

        // Initialize tags if they don't exist
        if (tagRepository.count() == 0) {
            log.info("Initializing default tags...");
            List<String> tagNames = Arrays.asList("react", "java", "springboot", "tutorial", "javascript", "news");
            for (String name : tagNames) {
                com.Blog.Platform.Blog.Model.Tag tag = new com.Blog.Platform.Blog.Model.Tag();
                tag.setName(name);
                tagRepository.save(tag);
            }
        }
    }
}
