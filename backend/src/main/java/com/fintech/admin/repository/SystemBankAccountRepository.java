package com.fintech.admin.repository;

import com.fintech.admin.entity.SystemBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemBankAccountRepository extends JpaRepository<SystemBankAccount, Long> {
}
