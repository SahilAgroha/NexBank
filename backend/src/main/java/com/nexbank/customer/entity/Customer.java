package com.nexbank.customer.entity;

import com.nexbank.auth.entity.User;
import com.nexbank.common.entity.BaseEntity;
import com.nexbank.common.enums.KycStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "customers", indexes = {
        @Index(name = "idx_customers_user_id", columnList = "user_id", unique = true)
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Customer extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "pan_number", length = 10)
    private String panNumber;

    @Column(name = "aadhar_number", length = 12)
    private String aadharNumber;

    @Column(name = "occupation", length = 100)
    private String occupation;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status", nullable = false)
    @Builder.Default
    private KycStatus kycStatus = KycStatus.PENDING;

    @Embedded
    private Address address;

    @Embedded
    private Nominee nominee;
}
