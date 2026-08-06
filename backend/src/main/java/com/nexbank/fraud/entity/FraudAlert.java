package com.nexbank.fraud.entity;

import com.nexbank.common.entity.BaseEntity;
import com.nexbank.common.enums.FraudSeverity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fraud_alerts", indexes = {
        @Index(name = "idx_fraud_account_id", columnList = "account_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class FraudAlert extends BaseEntity {

    @Column(name = "account_id", nullable = false, length = 36)
    private String accountId;

    @Column(name = "transaction_id", length = 36)
    private String transactionId;

    @Column(name = "rule_triggered", nullable = false, length = 100)
    private String ruleTriggered;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private FraudSeverity severity;

    @Column(name = "resolved", nullable = false)
    @Builder.Default
    private boolean resolved = false;
}
