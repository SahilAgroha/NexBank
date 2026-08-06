package com.nexbank.transaction.entity;

import com.nexbank.common.entity.BaseEntity;
import com.nexbank.common.enums.TransactionStatus;
import com.nexbank.common.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_tx_from_account", columnList = "from_account_id"),
        @Index(name = "idx_tx_to_account", columnList = "to_account_id"),
        @Index(name = "idx_tx_idempotency_key", columnList = "idempotency_key", unique = true),
        @Index(name = "idx_tx_reference", columnList = "reference")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Transaction extends BaseEntity {

    @Column(name = "idempotency_key", unique = true, length = 36)
    private String idempotencyKey;

    @Column(name = "reference", nullable = false, length = 50)
    private String reference;

    @Column(name = "from_account_id", length = 36)
    private String fromAccountId;

    @Column(name = "to_account_id", length = 36)
    private String toAccountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TransactionType type;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;
}
