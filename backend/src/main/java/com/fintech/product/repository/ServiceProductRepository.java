package com.fintech.product.repository;

import com.fintech.product.entity.ServiceProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceProductRepository extends JpaRepository<ServiceProduct, Long> {
    Page<ServiceProduct> findByIsActiveTrue(Pageable pageable);
    List<ServiceProduct> findByIsActiveTrue();
}
