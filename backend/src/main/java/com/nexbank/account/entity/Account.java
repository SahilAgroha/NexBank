package com.nexbank.account.entity;

import com.nexbank.common.entity.BaseEntity;
import com.nexbank.common.enums.AccountStatus;
import com.nexbank.common.enums.AccountType;
import com.nexbank.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "accounts", indexes = {
        @Index(name = "idx_accounts_account_number", columnList = "account_number", unique = true),
        @Index(name = "idx_accounts_customer_id", columnList = "customer_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Account extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "account_number", nullable = false, unique = true, length = 20)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;

    @Column(name = "balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "ifsc_code", length = 11)
    @Builder.Default
    private String ifscCode = "NEXB0001001";

    @Column(name = "branch", length = 100)
    @Builder.Default
    private String branch = "NexBank Main Branch";

    // Optimistic locking to prevent concurrent balance updates
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;
}
