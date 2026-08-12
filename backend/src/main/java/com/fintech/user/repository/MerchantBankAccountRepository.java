package com.fintech.user.repository;

import com.fintech.user.entity.MerchantBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MerchantBankAccountRepository extends JpaRepository<MerchantBankAccount, Long> {
    List<MerchantBankAccount> findByMerchantId(Long merchantId);
}
