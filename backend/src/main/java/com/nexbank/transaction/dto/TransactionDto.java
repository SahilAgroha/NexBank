package com.nexbank.transaction.dto;

import com.nexbank.common.enums.TransactionStatus;
import com.nexbank.common.enums.TransactionType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class TransactionDto {
    private String id;
    private String reference;
    private String fromAccountId;
    private String toAccountId;
    private TransactionType type;
    private BigDecimal amount;
    private TransactionStatus status;
    private String description;
    private Instant createdAt;
}
