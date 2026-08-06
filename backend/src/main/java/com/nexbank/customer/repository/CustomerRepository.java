package com.nexbank.customer.repository;

import com.nexbank.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String>, JpaSpecificationExecutor<Customer> {
    Optional<Customer> findByUserId(String userId);
    boolean existsByPanNumber(String panNumber);
    boolean existsByAadharNumber(String aadharNumber);
}
