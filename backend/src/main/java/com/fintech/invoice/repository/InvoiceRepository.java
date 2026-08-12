package com.fintech.invoice.repository;

import com.fintech.invoice.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Page<Invoice> findByUserId(Long userId, Pageable pageable);
    Optional<Invoice> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT i.serviceName, SUM(i.quantity) FROM InvoiceItem i WHERE i.invoice.createdAt BETWEEN :startDate AND :endDate GROUP BY i.serviceName ORDER BY SUM(i.quantity) DESC LIMIT 5")
    List<Object[]> getTopSellingProducts(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
