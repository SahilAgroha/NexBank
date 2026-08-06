package com.nexbank.account.repository;

import com.nexbank.account.entity.LedgerEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, String> {
    Page<LedgerEntry> findByAccountId(String accountId, Pageable pageable);
    Page<LedgerEntry> findByAccountIdOrderByCreatedAtDesc(String accountId, Pageable pageable);
}
