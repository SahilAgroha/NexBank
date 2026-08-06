package com.nexbank.payment.service;

import com.nexbank.account.entity.Account;
import com.nexbank.account.entity.LedgerEntry;
import com.nexbank.account.repository.LedgerEntryRepository;
import com.nexbank.account.service.AccountService;
import com.nexbank.common.enums.*;
import com.nexbank.common.exception.BadRequestException;
import com.nexbank.common.exception.ResourceNotFoundException;
import com.nexbank.payment.entity.Payment;
import com.nexbank.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AccountService accountService;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final RazorpayService razorpayService;

    @Transactional
    public Payment processUpiPayment(String fromAccountId, String upiId, BigDecimal amount, String desc) {
        Account account = accountService.getAccountEntityById(fromAccountId);
        validateBalance(account, amount);

        String reference = "UPI" + System.currentTimeMillis();
        Payment payment = Payment.builder()
                .fromAccountId(fromAccountId)
                .paymentType(PaymentType.UPI)
                .amount(amount)
                .upiId(upiId)
                .reference(reference)
                .description(desc)
                .status(TransactionStatus.PENDING)
                .build();
        payment = paymentRepository.save(payment);

        account.setBalance(account.getBalance().subtract(amount));
        accountService.saveAccount(account);

        ledgerEntryRepository.save(LedgerEntry.builder()
                .account(account).transactionId(payment.getId())
                .entryType(LedgerEntryType.DEBIT).amount(amount)
                .balanceAfter(account.getBalance()).reference(reference).build());

        payment.setStatus(TransactionStatus.COMPLETED);
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment processQrPayment(String fromAccountId, String qrData, BigDecimal amount) {
        Account account = accountService.getAccountEntityById(fromAccountId);
        validateBalance(account, amount);

        String reference = "QR" + System.currentTimeMillis();
        Payment payment = Payment.builder()
                .fromAccountId(fromAccountId)
                .paymentType(PaymentType.QR)
                .amount(amount).qrData(qrData).reference(reference)
                .status(TransactionStatus.PENDING).build();
        payment = paymentRepository.save(payment);

        account.setBalance(account.getBalance().subtract(amount));
        accountService.saveAccount(account);

        ledgerEntryRepository.save(LedgerEntry.builder()
                .account(account).transactionId(payment.getId())
                .entryType(LedgerEntryType.DEBIT).amount(amount)
                .balanceAfter(account.getBalance()).reference(reference).build());

        payment.setStatus(TransactionStatus.COMPLETED);
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment createRazorpayOrder(String fromAccountId, BigDecimal amount, String description) {
        Account account = accountService.getAccountEntityById(fromAccountId);
        validateBalance(account, amount);

        String orderId = razorpayService.createOrder(amount, description);
        String reference = "RPY" + System.currentTimeMillis();

        Payment payment = Payment.builder()
                .fromAccountId(fromAccountId)
                .paymentType(PaymentType.RAZORPAY)
                .amount(amount).razorpayOrderId(orderId)
                .reference(reference).description(description)
                .status(TransactionStatus.PENDING).build();
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment verifyRazorpayPayment(String razorpayOrderId, String razorpayPaymentId,
                                          String razorpaySignature) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", razorpayOrderId));

        boolean valid = razorpayService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!valid) {
            payment.setStatus(TransactionStatus.FAILED);
            paymentRepository.save(payment);
            throw new BadRequestException("INVALID_SIGNATURE", "Razorpay signature verification failed");
        }

        Account account = accountService.getAccountEntityById(payment.getFromAccountId());
        account.setBalance(account.getBalance().subtract(payment.getAmount()));
        accountService.saveAccount(account);

        ledgerEntryRepository.save(LedgerEntry.builder()
                .account(account).transactionId(payment.getId())
                .entryType(LedgerEntryType.DEBIT).amount(payment.getAmount())
                .balanceAfter(account.getBalance()).reference(payment.getReference()).build());

        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setStatus(TransactionStatus.COMPLETED);
        return paymentRepository.save(payment);
    }

    public Page<Payment> getPaymentHistory(String accountId, Pageable pageable) {
        return paymentRepository.findByFromAccountId(accountId, pageable);
    }

    private void validateBalance(Account account, BigDecimal amount) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("ACCOUNT_NOT_ACTIVE", "Account is not active");
        }
        if (account.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("INSUFFICIENT_BALANCE", "Insufficient balance");
        }
    }
}
