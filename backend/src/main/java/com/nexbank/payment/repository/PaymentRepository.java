package com.nexbank.payment.repository;

import com.nexbank.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    Page<Payment> findByFromAccountId(String accountId, Pageable pageable);
    Optional<Payment> findByRazorpayOrderId(String orderId);
}
