package com.fintech.wallet.dto;

import com.fintech.wallet.entity.RechargeStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RechargeRequestDTO {
    private Long id;
    private Long partnerId;
    private String partnerEmail;
    private BigDecimal amount;
    private String referenceNumber;
    private RechargeStatus status;
    private String adminRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
