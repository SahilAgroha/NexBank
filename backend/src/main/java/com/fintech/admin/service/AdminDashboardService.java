package com.fintech.admin.service;

import com.fintech.admin.dto.AdminDashboardStatsDTO;
import com.fintech.admin.dto.DailyTransactionCount;
import com.fintech.admin.dto.TopProductData;
import com.fintech.admin.dto.TransactionStatusMetric;
import com.fintech.invoice.repository.InvoiceRepository;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.transaction.repository.TransactionRepository;
import com.fintech.user.entity.Role;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final InvoiceRepository invoiceRepository;

    public AdminDashboardStatsDTO getDashboardStats(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDate.now().atTime(23, 59, 59);

        // Chart Data (Sales Trend - using transaction count for now, can be updated to amount if needed)
        List<Object[]> rawChartData = transactionRepository.getDailyTransactionCountSince(start);
        List<DailyTransactionCount> chartData = rawChartData.stream().map(obj -> {
            String date = obj[0].toString();
            long count = ((Number) obj[1]).longValue();
            return new DailyTransactionCount(date, count);
        }).collect(Collectors.toList());

        // Purchase Data
        BigDecimal totalPurchased = transactionRepository.sumAmountByTypeAndDateRange(TransactionType.SERVICE_PAYMENT, start, end);
        
        // Customer Wallets
        BigDecimal totalCustomerWalletBalance = walletRepository.getTotalBalanceByRole(Role.USER);
        
        // Commissions
        BigDecimal commissionOut = transactionRepository.sumAmountByTypeAndDateRange(TransactionType.COMMISSION, start, end);
        
        // Calculate Commission IN (Mocked as 2.5% of total purchases for demonstration, since we don't track vendor margins)
        BigDecimal commissionIn = totalPurchased.multiply(new BigDecimal("0.025")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netProfit = commissionIn.subtract(commissionOut);

        // Transaction Status Metrics
        List<Object[]> rawTxStats = transactionRepository.getTransactionStatsByDateRange(start, end);
        List<TransactionStatusMetric> txStats = rawTxStats.stream().map(obj -> {
            String status = obj[0].toString();
            long count = ((Number) obj[1]).longValue();
            BigDecimal amount = (BigDecimal) obj[2];
            return new TransactionStatusMetric(status, count, amount);
        }).collect(Collectors.toList());

        // Top Products
        List<Object[]> rawTopProducts = invoiceRepository.getTopSellingProducts(start, end);
        List<TopProductData> topProducts = rawTopProducts.stream().map(obj -> {
            String name = obj[0].toString();
            long count = ((Number) obj[1]).longValue();
            return new TopProductData(name, count);
        }).collect(Collectors.toList());

        return AdminDashboardStatsDTO.builder()
                .totalUsers(userRepository.countByRole(Role.USER))
                .totalPartners(userRepository.countByRole(Role.PARTNER))
                .systemBalance(walletRepository.getTotalSystemBalance())
                .dailyTransactions(transactionRepository.countTransactionsSince(start))
                .chartData(chartData)
                .totalPurchased(totalPurchased)
                .totalCustomerWalletBalance(totalCustomerWalletBalance)
                .commissionIn(commissionIn)
                .commissionOut(commissionOut)
                .netProfit(netProfit)
                .transactionStats(txStats)
                .topProducts(topProducts)
                .build();
    }
}
