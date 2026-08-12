package com.fintech.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AdminDashboardStatsDTO {
    private long totalUsers;
    private long totalPartners;
    private BigDecimal systemBalance;
    private long dailyTransactions;
    private List<DailyTransactionCount> chartData;

    // New metrics
    private BigDecimal totalPurchased;
    private BigDecimal totalCustomerWalletBalance;
    private BigDecimal commissionIn;
    private BigDecimal commissionOut;
    private BigDecimal netProfit;
    
    private List<TransactionStatusMetric> transactionStats;
    private List<TopProductData> topProducts;
}
