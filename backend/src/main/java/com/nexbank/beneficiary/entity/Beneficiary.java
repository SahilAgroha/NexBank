package com.nexbank.beneficiary.entity;

import com.nexbank.common.entity.BaseEntity;
import com.nexbank.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "beneficiaries", indexes = {
        @Index(name = "idx_beneficiary_customer_id", columnList = "customer_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Beneficiary extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "account_number", nullable = false, length = 20)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 11)
    private String ifscCode;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "verified", nullable = false)
    @Builder.Default
    private boolean verified = false; // OTP verified before first transfer
}
