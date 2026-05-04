package com.Blog.Platform.User.Service;

import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Model.UserBlock;
import com.Blog.Platform.User.Repo.FollowRepository;
import com.Blog.Platform.User.Repo.UserBlockRepository;
import com.Blog.Platform.User.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlockService {

    private final UserBlockRepository blockRepository;
    private final UserRepo userRepository;
    private final FollowRepository followRepository;

    @Transactional
    public void blockUser(UUID targetUserId) {
        String email = SecurityUtil.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        if (currentUser.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot block yourself");
        }

        User targetUser = userRepository.findById(targetUserId).orElseThrow();
        if (blockRepository.existsByBlockerIdAndBlockedId(currentUser.getId(), targetUserId)) {
            return;
        }

        UserBlock block = new UserBlock();
        block.setBlocker(currentUser);
        block.setBlocked(targetUser);
        blockRepository.save(block);

        // Auto-unfollow in both directions
        followRepository.deleteByFollowerAndFollowing(currentUser, targetUser);
        followRepository.deleteByFollowerAndFollowing(targetUser, currentUser);
    }

    @Transactional
    public void unblockUser(UUID targetUserId) {
        String email = SecurityUtil.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        blockRepository.findByBlockerIdAndBlockedId(currentUser.getId(), targetUserId)
                .ifPresent(blockRepository::delete);
    }

    public boolean isBlocked(UUID userA, UUID userB) {
        if (userA == null || userB == null) return false;
        return blockRepository.existsBlockBetween(userA, userB);
    }

    public List<UUID> getBlockedUsersIds(UUID userId) {
        return blockRepository.findByBlockerId(userId).stream()
                .map(block -> block.getBlocked().getId())
                .collect(Collectors.toList());
    }
}
