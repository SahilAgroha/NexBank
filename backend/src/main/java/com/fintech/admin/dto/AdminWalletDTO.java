package com.fintech.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AdminWalletDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String fullName;
    private BigDecimal balance;
    private String currency;
}
