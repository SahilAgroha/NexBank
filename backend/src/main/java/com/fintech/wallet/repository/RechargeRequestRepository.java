package com.fintech.wallet.repository;

import com.fintech.wallet.entity.RechargeRequest;
import com.fintech.wallet.entity.RechargeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RechargeRequestRepository extends JpaRepository<RechargeRequest, Long> {
    Page<RechargeRequest> findByPartnerId(Long partnerId, Pageable pageable);
    Page<RechargeRequest> findByStatus(RechargeStatus status, Pageable pageable);
}
