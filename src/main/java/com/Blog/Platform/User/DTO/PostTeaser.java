package com.Blog.Platform.User.DTO;

import com.Blog.Platform.Blog.Model.BlogPost;

public record PostTeaser(BlogPost post, String teaser) {}
