package com.Blog.Platform.Blog.Service;

import java.util.UUID;

public interface CoauthorService {

    void invite(UUID blogId, UUID invitedUserId, UUID invitingUserId);

    void accept(String token);

    void decline(String token);

    void remove(UUID blogId, UUID userId, UUID requestingUserId);
}
