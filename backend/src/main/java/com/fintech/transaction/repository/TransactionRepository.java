package com.fintech.transaction.repository;

import com.fintech.transaction.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fintech.transaction.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {
    
    @Query("SELECT t FROM Transaction t WHERE t.senderWallet.id = :walletId OR t.receiverWallet.id = :walletId ORDER BY t.createdAt DESC")
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(@Param("walletId") Long walletId);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.createdAt >= :startDate")
    long countTransactionsSince(@Param("startDate") LocalDateTime startDate);
    
    @Query(value = "SELECT cast(created_at as date) as date, COUNT(*) as count FROM transactions WHERE created_at >= :startDate GROUP BY cast(created_at as date) ORDER BY date", nativeQuery = true)
    List<Object[]> getDailyTransactionCountSince(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type AND t.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByTypeAndDateRange(@Param("type") TransactionType type, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t.status, COUNT(t), COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.createdAt BETWEEN :startDate AND :endDate GROUP BY t.status")
    List<Object[]> getTransactionStatsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    List<Transaction> findBySenderWalletIdOrReceiverWalletId(Long senderWalletId, Long receiverWalletId);
}
