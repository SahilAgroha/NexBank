package com.fintech.admin.service;

import com.fintech.transaction.entity.Transaction;
import com.fintech.transaction.entity.TransactionStatus;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.transaction.repository.TransactionRepository;
import com.fintech.transaction.repository.TransactionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminTransactionService {

    private final TransactionRepository transactionRepository;

    public Page<Transaction> getAllTransactions(
            LocalDate startDate,
            LocalDate endDate,
            TransactionStatus status,
            TransactionType type,
            String search,
            Pageable pageable
    ) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : null;
        
        Specification<Transaction> spec = TransactionSpecification.filterBy(start, end, status, type, search);
        return transactionRepository.findAll(spec, pageable);
    }

    @Transactional
    public void approveTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Only pending transactions can be approved");
        }
        
        transaction.setStatus(TransactionStatus.SUCCESS);
        transactionRepository.save(transaction);
        // Note: Real implementation would handle actual fund settlement, notifications, etc.
    }
}
