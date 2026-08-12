package com.fintech.partner.repository;

import com.fintech.partner.entity.CommissionRule;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.user.entity.PartnerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommissionRuleRepository extends JpaRepository<CommissionRule, Long> {
    Optional<CommissionRule> findByPartnerTypeAndTransactionType(PartnerType partnerType, TransactionType transactionType);
}
