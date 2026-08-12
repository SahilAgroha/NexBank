package com.fintech.user.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "merchant_bank_accounts")
@Data
public class MerchantBankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User merchant;

    @Column(nullable = false)
    private String institution;

    @Column(nullable = false)
    private String accountMetadata; // Could be account number

    @Column(nullable = false)
    private String ifscAndContact; // E.g., IFSC - Mobile Number

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
