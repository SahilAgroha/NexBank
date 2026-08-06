package com.nexbank.customer.entity;

import com.nexbank.common.entity.BaseEntity;
import com.nexbank.common.enums.KycStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kyc_documents")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class KycDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType; // PAN, AADHAR, PASSPORT, UTILITY_BILL

    @Column(name = "cloudinary_public_id", nullable = false)
    private String cloudinaryPublicId;

    @Column(name = "cloudinary_url", nullable = false)
    private String cloudinaryUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private KycStatus status = KycStatus.SUBMITTED;

    @Column(name = "rejection_reason")
    private String rejectionReason;
}
