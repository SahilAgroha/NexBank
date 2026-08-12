package com.fintech.security.repository;

import com.fintech.security.entity.IdempotencyKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, String> {
    void deleteByCreatedAtBefore(LocalDateTime expiryTime);
}
