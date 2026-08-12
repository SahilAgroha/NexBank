package com.fintech.partner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerDashboardResponse {
    private BigDecimal totalCommission;
    private long totalCustomers;
    private long totalDownlinePartners;
    private BigDecimal currentWalletBalance;
}
