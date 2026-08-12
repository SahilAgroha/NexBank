package com.fintech.user.repository;

import com.fintech.user.entity.User;
import com.fintech.user.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByPartnerCode(String partnerCode);
    Optional<User> findByEmailOrPhone(String email, String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    
    java.util.List<User> findByParentPartnerId(Long parentPartnerId);
    long countByParentPartnerId(Long parentPartnerId);
    
    Page<User> findByRole(Role role, Pageable pageable);
    java.util.List<User> findByRole(Role role);
    long countByRole(Role role);
}
