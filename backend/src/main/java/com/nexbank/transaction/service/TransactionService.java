package com.nexbank.transaction.service;

import com.nexbank.account.entity.Account;
import com.nexbank.account.entity.LedgerEntry;
import com.nexbank.account.repository.LedgerEntryRepository;
import com.nexbank.account.service.AccountService;
import com.nexbank.common.enums.*;
import com.nexbank.common.exception.BadRequestException;
import com.nexbank.customer.entity.Customer;
import com.nexbank.customer.service.CustomerService;
import com.nexbank.fraud.service.FraudDetectionService;
import com.nexbank.notification.service.EmailService;
import com.nexbank.notification.service.NotificationService;
import com.nexbank.transaction.dto.*;
import com.nexbank.transaction.entity.Transaction;
import com.nexbank.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final CustomerService customerService;
    private final FraudDetectionService fraudDetectionService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // ─── Deposit ─────────────────────────────────────────────

    @Transactional
    public TransactionDto deposit(DepositRequest request) {
        // Idempotency check
        if (request.getIdempotencyKey() != null) {
            var existing = transactionRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) return toDto(existing.get());
        }

        Account account = accountService.getAccountEntityById(request.getAccountId());
        validateAccountActive(account);

        String reference = generateReference("DEP");

        // Create transaction record
        Transaction tx = Transaction.builder()
                .idempotencyKey(request.getIdempotencyKey() != null ?
                        request.getIdempotencyKey() : UUID.randomUUID().toString())
                .reference(reference)
                .toAccountId(account.getId())
                .type(TransactionType.DEPOSIT)
                .amount(request.getAmount())
                .status(TransactionStatus.PENDING)
                .description(request.getDescription() != null ? request.getDescription() : "Deposit")
                .build();
        tx = transactionRepository.save(tx);

        // Update balance
        account.setBalance(account.getBalance().add(request.getAmount()));
        accountService.saveAccount(account);

        // Create ledger entry
        createLedgerEntry(account, tx.getId(), LedgerEntryType.CREDIT,
                request.getAmount(), account.getBalance(), reference);

        tx.setStatus(TransactionStatus.COMPLETED);
        tx = transactionRepository.save(tx);

        // Notifications
        Customer customer = account.getCustomer();
        emailService.sendTransactionAlert(customer.getUser().getEmail(), customer.getUser().getFirstName(),
                "Deposit", request.getAmount(), account.getAccountNumber(), reference);
        notificationService.createNotification(customer.getUser().getId(), NotificationType.TRANSACTION,
                "₹" + request.getAmount() + " credited to account " + account.getAccountNumber());

        return toDto(tx);
    }

    // ─── Withdrawal ──────────────────────────────────────────

    @Transactional
    public TransactionDto withdraw(WithdrawRequest request) {
        if (request.getIdempotencyKey() != null) {
            var existing = transactionRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) return toDto(existing.get());
        }

        Account account = accountService.getAccountEntityById(request.getAccountId());
        validateAccountActive(account);

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("INSUFFICIENT_BALANCE", "Insufficient balance");
        }

        String reference = generateReference("WDR");
        Transaction tx = Transaction.builder()
                .idempotencyKey(request.getIdempotencyKey() != null ?
                        request.getIdempotencyKey() : UUID.randomUUID().toString())
                .reference(reference)
                .fromAccountId(account.getId())
                .type(TransactionType.WITHDRAWAL)
                .amount(request.getAmount())
                .status(TransactionStatus.PENDING)
                .description(request.getDescription() != null ? request.getDescription() : "Withdrawal")
                .build();
        tx = transactionRepository.save(tx);

        account.setBalance(account.getBalance().subtract(request.getAmount()));
        accountService.saveAccount(account);

        createLedgerEntry(account, tx.getId(), LedgerEntryType.DEBIT,
                request.getAmount(), account.getBalance(), reference);

        tx.setStatus(TransactionStatus.COMPLETED);
        tx = transactionRepository.save(tx);

        Customer customer = account.getCustomer();
        emailService.sendTransactionAlert(customer.getUser().getEmail(), customer.getUser().getFirstName(),
                "Withdrawal", request.getAmount(), account.getAccountNumber(), reference);
        notificationService.createNotification(customer.getUser().getId(), NotificationType.TRANSACTION,
                "₹" + request.getAmount() + " debited from account " + account.getAccountNumber());

        return toDto(tx);
    }

    // ─── Transfer ────────────────────────────────────────────

    @Transactional
    public TransactionDto transfer(TransferRequest request) {
        if (request.getIdempotencyKey() != null) {
            var existing = transactionRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) return toDto(existing.get());
        }

        Account fromAccount = accountService.getAccountEntityById(request.getFromAccountId());
        validateAccountActive(fromAccount);

        Account toAccount = accountService.getAccountEntityByNumber(request.getToAccountNumber());
        validateAccountActive(toAccount);

        if (fromAccount.getId().equals(toAccount.getId())) {
            throw new BadRequestException("Cannot transfer to the same account");
        }
        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("INSUFFICIENT_BALANCE", "Insufficient balance");
        }

        // Fraud detection
        fraudDetectionService.checkTransfer(fromAccount, request.getAmount());

        String reference = generateReference("TRF");
        String idemKey = request.getIdempotencyKey() != null ?
                request.getIdempotencyKey() : UUID.randomUUID().toString();

        Transaction tx = Transaction.builder()
                .idempotencyKey(idemKey)
                .reference(reference)
                .fromAccountId(fromAccount.getId())
                .toAccountId(toAccount.getId())
                .type(TransactionType.TRANSFER_DEBIT)
                .amount(request.getAmount())
                .status(TransactionStatus.PENDING)
                .description(request.getDescription() != null ? request.getDescription() : "Fund Transfer")
                .build();
        tx = transactionRepository.save(tx);

        // Double-entry: debit sender, credit receiver
        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));
        accountService.saveAccount(fromAccount);
        accountService.saveAccount(toAccount);

        createLedgerEntry(fromAccount, tx.getId(), LedgerEntryType.DEBIT,
                request.getAmount(), fromAccount.getBalance(), reference);
        createLedgerEntry(toAccount, tx.getId(), LedgerEntryType.CREDIT,
                request.getAmount(), toAccount.getBalance(), reference);

        tx.setStatus(TransactionStatus.COMPLETED);
        tx = transactionRepository.save(tx);

        // Notify both parties
        Customer sender = fromAccount.getCustomer();
        Customer receiver = toAccount.getCustomer();
        emailService.sendTransactionAlert(sender.getUser().getEmail(), sender.getUser().getFirstName(),
                "Transfer Sent", request.getAmount(), fromAccount.getAccountNumber(), reference);
        emailService.sendTransactionAlert(receiver.getUser().getEmail(), receiver.getUser().getFirstName(),
                "Transfer Received", request.getAmount(), toAccount.getAccountNumber(), reference);
        notificationService.createNotification(sender.getUser().getId(), NotificationType.TRANSACTION,
                "₹" + request.getAmount() + " transferred to " + toAccount.getAccountNumber());

        return toDto(tx);
    }

    // ─── History & Statement ─────────────────────────────────

    public Page<TransactionDto> getTransactionHistory(String accountId, Pageable pageable) {
        return transactionRepository.findByAccountId(accountId, pageable).map(this::toDto);
    }

    // ─── Internal Helpers ────────────────────────────────────

    private void validateAccountActive(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("ACCOUNT_NOT_ACTIVE",
                    "Account " + account.getAccountNumber() + " is not active");
        }
    }

    private void createLedgerEntry(Account account, String txId, LedgerEntryType type,
                                   BigDecimal amount, BigDecimal balanceAfter, String reference) {
        LedgerEntry entry = LedgerEntry.builder()
                .account(account)
                .transactionId(txId)
                .entryType(type)
                .amount(amount)
                .balanceAfter(balanceAfter)
                .description(type.name() + " " + reference)
                .reference(reference)
                .build();
        ledgerEntryRepository.save(entry);
    }

    private String generateReference(String prefix) {
        return prefix + System.currentTimeMillis();
    }

    public TransactionDto toDto(Transaction t) {
        return TransactionDto.builder()
                .id(t.getId())
                .reference(t.getReference())
                .fromAccountId(t.getFromAccountId())
                .toAccountId(t.getToAccountId())
                .type(t.getType())
                .amount(t.getAmount())
                .status(t.getStatus())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
