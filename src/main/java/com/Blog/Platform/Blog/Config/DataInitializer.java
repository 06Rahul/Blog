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

    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize categories if they don't exist
        if (categoryRepository.count() == 0) {
            log.info("Initializing default categories...");

            List<String> categoryNames = Arrays.asList(
                    "Travel",
                    "Sports",
                    "Entertainment",
                    "Tech");

            for (String name : categoryNames) {
                Category category = new Category();
                category.setName(name);
                categoryRepository.save(category);
                log.info("Created category: {}", name);
            }

            log.info("Default categories initialized successfully!");
        } else {
            log.info("Categories already exist, skipping initialization");
        }
    }
}
