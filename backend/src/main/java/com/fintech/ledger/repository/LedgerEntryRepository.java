package com.fintech.ledger.repository;

import com.fintech.ledger.entity.LedgerEntry;
import com.fintech.ledger.entity.LedgerEntryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {

    // For User/Partner Ledger filtering with pagination
    @Query("SELECT l FROM LedgerEntry l WHERE l.wallet.id = :walletId " +
           "AND (:startDate IS NULL OR l.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR l.createdAt <= :endDate) " +
           "AND (:type IS NULL OR l.type = :type) " +
           "ORDER BY l.createdAt DESC")
    Page<LedgerEntry> findLedgerEntries(
            @Param("walletId") Long walletId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("type") LedgerEntryType type,
            Pageable pageable);

    // For CSV Export (No pagination)
    @Query("SELECT l FROM LedgerEntry l WHERE l.wallet.id = :walletId " +
           "AND (:startDate IS NULL OR l.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR l.createdAt <= :endDate) " +
           "AND (:type IS NULL OR l.type = :type) " +
           "ORDER BY l.createdAt DESC")
    List<LedgerEntry> findAllLedgerEntries(
            @Param("walletId") Long walletId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("type") LedgerEntryType type);

    // Global Ledger for Admins with pagination
    @Query("SELECT l FROM LedgerEntry l WHERE " +
           "(:startDate IS NULL OR l.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR l.createdAt <= :endDate) " +
           "AND (:type IS NULL OR l.type = :type) " +
           "ORDER BY l.createdAt DESC")
    Page<LedgerEntry> findSystemLedgerEntries(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("type") LedgerEntryType type,
            Pageable pageable);

    // Global Ledger for CSV Export
    @Query("SELECT l FROM LedgerEntry l WHERE " +
           "(:startDate IS NULL OR l.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR l.createdAt <= :endDate) " +
           "AND (:type IS NULL OR l.type = :type) " +
           "ORDER BY l.createdAt DESC")
    List<LedgerEntry> findAllSystemLedgerEntries(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("type") LedgerEntryType type);
}
