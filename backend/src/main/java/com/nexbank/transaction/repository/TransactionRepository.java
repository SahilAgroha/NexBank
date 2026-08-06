package com.nexbank.transaction.repository;

import com.nexbank.transaction.entity.Transaction;
import com.nexbank.common.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    Optional<Transaction> findByIdempotencyKey(String key);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccountId = :accountId OR t.toAccountId = :accountId) ORDER BY t.createdAt DESC")
    Page<Transaction> findByAccountId(String accountId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccountId = :accountId OR t.toAccountId = :accountId) AND t.createdAt BETWEEN :from AND :to ORDER BY t.createdAt DESC")
    List<Transaction> findByAccountIdAndDateRange(String accountId, Instant from, Instant to);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccountId = :accountId OR t.toAccountId = :accountId) ORDER BY t.createdAt DESC")
    List<Transaction> findTop10ByAccountId(String accountId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.fromAccountId = :accountId AND t.status = :status AND t.createdAt >= :since")
    java.math.BigDecimal sumTransferredSince(String accountId, TransactionStatus status, Instant since);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.fromAccountId = :accountId AND t.createdAt >= :since")
    long countTransactionsSince(String accountId, Instant since);
}
