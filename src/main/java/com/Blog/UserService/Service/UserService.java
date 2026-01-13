package com.Blog.UserService.Service;

import com.Blog.UserService.Model.User;

import java.util.Optional;

public interface UserService {

    public

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
