package com.Blog.Platform.User.Repo;

import com.Blog.Platform.User.Model.CreditLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;
import java.util.Optional;

public interface CreditLedgerRepository extends JpaRepository<CreditLedger, UUID> {

    @Query("SELECT SUM(c.amount) FROM CreditLedger c WHERE c.user.id = :userId")
    Optional<Integer> calculateBalance(@Param("userId") UUID userId);

    @Query("SELECT SUM(c.amount) FROM CreditLedger c WHERE c.blog.id = :blogId AND c.transactionType = 'RECEIVE_TIP'")
    Optional<Integer> countTipsReceptedForBlog(@Param("blogId") UUID blogId);

    // Lock query to ensure atomicity, Spring Data JPA allows native query locks implicitly or via @Lock
    // Alternatively, we use FOR SHARE in native queries
    @Query(value = "SELECT sum(amount) FROM credit_ledger WHERE user_id = :userId FOR SHARE", nativeQuery = true)
    Optional<Integer> getBalanceWithLock(@Param("userId") String userId);
}
