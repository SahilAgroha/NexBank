package com.nexbank.account.repository;

import com.nexbank.account.entity.Account;
import com.nexbank.common.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    List<Account> findByCustomerId(String customerId);
    Optional<Account> findByAccountNumber(String accountNumber);
    boolean existsByAccountNumber(String accountNumber);

    @Query("SELECT a FROM Account a WHERE a.customer.id = :customerId AND a.status = :status")
    List<Account> findByCustomerIdAndStatus(String customerId, AccountStatus status);
}
