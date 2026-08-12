package com.fintech.ledger.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class LedgerEntryDTO {
    private Long id;
    private String referenceNumber;
    private String type;
    private BigDecimal amount;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private String description;
    private LocalDateTime createdAt;
    
    // For admin system ledger
    private String userEmail;
    private Long walletId;
}
