package com.fintech.product.repository;

import com.fintech.product.entity.UserServiceAuthorization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserServiceAuthorizationRepository extends JpaRepository<UserServiceAuthorization, Long> {
    List<UserServiceAuthorization> findByUserId(Long userId);
    Optional<UserServiceAuthorization> findByUserIdAndServiceProductId(Long userId, Long serviceProductId);
}
