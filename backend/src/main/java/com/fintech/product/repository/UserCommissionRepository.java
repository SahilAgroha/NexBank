package com.fintech.product.repository;

import com.fintech.product.entity.UserCommission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCommissionRepository extends JpaRepository<UserCommission, Long> {
    List<UserCommission> findByUserId(Long userId);
    Optional<UserCommission> findByUserIdAndServiceProductId(Long userId, Long serviceProductId);
}
