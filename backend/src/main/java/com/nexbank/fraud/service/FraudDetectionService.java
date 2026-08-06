package com.nexbank.fraud.service;

import com.nexbank.account.entity.Account;
import com.nexbank.common.enums.FraudSeverity;
import com.nexbank.common.enums.TransactionStatus;
import com.nexbank.common.exception.BadRequestException;
import com.nexbank.fraud.entity.FraudAlert;
import com.nexbank.fraud.repository.FraudAlertRepository;
import com.nexbank.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final FraudAlertRepository fraudAlertRepository;
    private final TransactionRepository transactionRepository;

    @Value("${fraud.daily-transfer-limit}")
    private BigDecimal dailyTransferLimit;

    @Value("${fraud.large-transaction-threshold}")
    private BigDecimal largeTransactionThreshold;

    @Value("${fraud.velocity-window-minutes}")
    private int velocityWindowMinutes;

    @Value("${fraud.velocity-max-transactions}")
    private int velocityMaxTransactions;

    private static final java.util.Set<String> BLACKLISTED_ACCOUNTS = new java.util.HashSet<>();

    /**
     * Run all fraud checks for a transfer.
     * Throws BadRequestException if transfer should be blocked.
     * Saves FraudAlert for suspicious but allowed transactions.
     */
    public void checkTransfer(Account fromAccount, BigDecimal amount) {
        String accountId = fromAccount.getId();

        // 1. Blacklist check
        if (BLACKLISTED_ACCOUNTS.contains(fromAccount.getAccountNumber())) {
            createAlert(accountId, null, "BLACKLISTED_ACCOUNT",
                    "Transfer attempted from blacklisted account", FraudSeverity.CRITICAL);
            throw new BadRequestException("ACCOUNT_BLACKLISTED", "Transaction blocked by fraud system");
        }

        // 2. Daily transfer limit check
        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
        BigDecimal dailyTotal = transactionRepository.sumTransferredSince(
                accountId, TransactionStatus.COMPLETED, startOfDay);
        if (dailyTotal == null) dailyTotal = BigDecimal.ZERO;

        if (dailyTotal.add(amount).compareTo(dailyTransferLimit) > 0) {
            createAlert(accountId, null, "DAILY_LIMIT_EXCEEDED",
                    "Daily transfer limit exceeded. Attempted: ₹" + dailyTotal.add(amount), FraudSeverity.HIGH);
            throw new BadRequestException("DAILY_LIMIT_EXCEEDED",
                    "Daily transfer limit of ₹" + dailyTransferLimit + " exceeded");
        }

        // 3. Velocity check
        Instant velocityWindowStart = Instant.now().minus(velocityWindowMinutes, ChronoUnit.MINUTES);
        long txCount = transactionRepository.countTransactionsSince(accountId, velocityWindowStart);
        if (txCount >= velocityMaxTransactions) {
            createAlert(accountId, null, "VELOCITY_EXCEEDED",
                    txCount + " transactions in last " + velocityWindowMinutes + " minutes", FraudSeverity.HIGH);
            throw new BadRequestException("VELOCITY_EXCEEDED",
                    "Too many transactions in a short period. Please try again later.");
        }

        // 4. Large transaction flag (allowed but flagged)
        if (amount.compareTo(largeTransactionThreshold) > 0) {
            createAlert(accountId, null, "LARGE_TRANSACTION",
                    "Large transaction detected: ₹" + amount, FraudSeverity.MEDIUM);
            log.warn("Large transaction flagged for account {}: ₹{}", accountId, amount);
        }
    }

    public FraudAlert createAlert(String accountId, String txId, String rule,
                                  String description, FraudSeverity severity) {
        FraudAlert alert = FraudAlert.builder()
                .accountId(accountId)
                .transactionId(txId)
                .ruleTriggered(rule)
                .description(description)
                .severity(severity)
                .build();
        return fraudAlertRepository.save(alert);
    }

    public void resolveAlert(String alertId) {
        FraudAlert alert = fraudAlertRepository.findById(alertId)
                .orElseThrow(() -> new com.nexbank.common.exception.ResourceNotFoundException("FraudAlert", alertId));
        alert.setResolved(true);
        fraudAlertRepository.save(alert);
    }
}
