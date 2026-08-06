package com.nexbank.customer.repository;

import com.nexbank.customer.entity.KycDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KycDocumentRepository extends JpaRepository<KycDocument, String> {
    List<KycDocument> findByCustomerId(String customerId);
}
