package com.fintech.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminTransactionDTO {
    private Long id;
    private String referenceNumber;
    private Long senderWalletId;
    private String senderEmail;
    private Long receiverWalletId;
    private String receiverEmail;
    private BigDecimal amount;
    private String type;
    private String status;
    private String description;
    private LocalDateTime createdAt;
}
