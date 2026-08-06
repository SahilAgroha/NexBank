package com.nexbank.beneficiary.repository;

import com.nexbank.beneficiary.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, String> {
    List<Beneficiary> findByCustomerId(String customerId);
    Optional<Beneficiary> findByIdAndCustomerId(String id, String customerId);
    boolean existsByCustomerIdAndAccountNumber(String customerId, String accountNumber);
}
