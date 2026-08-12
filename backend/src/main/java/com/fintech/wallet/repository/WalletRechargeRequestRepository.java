package com.fintech.wallet.repository;

import com.fintech.wallet.entity.WalletRechargeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletRechargeRequestRepository extends JpaRepository<WalletRechargeRequest, Long> {
    List<WalletRechargeRequest> findByUserId(Long userId);
    List<WalletRechargeRequest> findByStatus(WalletRechargeRequest.RequestStatus status);
}
