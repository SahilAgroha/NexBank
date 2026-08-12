package com.fintech.wallet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletRechargeRequestDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private BigDecimal amount;
    private String referenceNumber;
    private String transferMode;
    private String status;
    private String adminRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
