package com.Blog.Platform.User.Service;

import com.Blog.Platform.Blog.Model.BlogPost;
import com.Blog.Platform.Blog.Repo.BlogPostRepository;
import com.Blog.Platform.Blog.Util.SecurityUtil;
import com.Blog.Platform.User.Model.CreditLedger;
import com.Blog.Platform.User.Model.TransactionType;
import com.Blog.Platform.User.Model.User;
import com.Blog.Platform.User.Repo.CreditLedgerRepository;
import com.Blog.Platform.User.Repo.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VirtualKudosService {

    private final CreditLedgerRepository creditLedgerRepo;
    private final BlogPostRepository blogPostRepo;
    private final UserRepo userRepo;

    public int getBalance(UUID userId) {
        return creditLedgerRepo.calculateBalance(userId).orElse(0);
    }

    @Transactional
    public void awardPoints(UUID userId, UUID blogId, TransactionType type, int amount, String referenceId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return;

        BlogPost blog = null;
        if (blogId != null) {
            blog = blogPostRepo.findById(blogId).orElse(null);
        }

        CreditLedger ledger = new CreditLedger();
        ledger.setUser(user);
        ledger.setBlog(blog);
        ledger.setTransactionType(type);
        ledger.setAmount(amount);
        ledger.setReferenceId(referenceId);
        creditLedgerRepo.save(ledger);
        
        log.info("Awarded {} points to user {} for {}", amount, user.getUsername(), type);
    }

    @Transactional
    public void tipBlog(UUID blogId, int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        String email = SecurityUtil.getCurrentUserEmail();
        User sender = userRepo.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));

        BlogPost blog = blogPostRepo.findById(blogId)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found"));
                
        if (sender.getId().equals(blog.getAuthor().getId())) {
            throw new IllegalArgumentException("You cannot tip your own blog");
        }

        // Retrieve and lock sender balance
        int currentBalance = creditLedgerRepo.getBalanceWithLock(sender.getId().toString()).orElse(0);
        if (currentBalance < amount) {
            throw new IllegalArgumentException("Insufficient Kudos balance. You have " + currentBalance + ", but tried to tip " + amount);
        }

        // Deduct from sender
        CreditLedger spend = new CreditLedger();
        spend.setUser(sender);
        spend.setBlog(blog);
        spend.setTransactionType(TransactionType.SPEND_TIP);
        spend.setAmount(-amount);
        creditLedgerRepo.save(spend);

        // Add to author
        CreditLedger receive = new CreditLedger();
        receive.setUser(blog.getAuthor());
        receive.setBlog(blog);
        receive.setTransactionType(TransactionType.RECEIVE_TIP);
        receive.setAmount(amount);
        creditLedgerRepo.save(receive);
        
        log.info("User {} tipped {} kudos to blog {}", sender.getUsername(), amount, blogId);
    }
}
