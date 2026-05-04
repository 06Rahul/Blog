package com.Blog.Platform.Blog.Repo;

import com.Blog.Platform.Blog.Model.TagStat;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TagStatRepository extends JpaRepository<TagStat, String> {
    List<TagStat> findAllByOrderByViews24hDesc(Pageable pageable);
    List<TagStat> findByTagNameContainingIgnoreCaseOrderByViews24hDesc(String query, Pageable pageable);
}
