package com.nexbank.fraud.repository;

import com.nexbank.fraud.entity.FraudAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, String> {
    Page<FraudAlert> findByResolvedFalse(Pageable pageable);
    Page<FraudAlert> findByAccountId(String accountId, Pageable pageable);
}
