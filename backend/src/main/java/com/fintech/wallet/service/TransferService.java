package com.fintech.wallet.service;

import com.fintech.email.service.EmailService;
import com.fintech.notification.service.NotificationService;
import com.fintech.transaction.entity.Ledger;
import com.fintech.transaction.entity.Transaction;
import com.fintech.transaction.entity.TransactionStatus;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.transaction.repository.LedgerRepository;
import com.fintech.transaction.repository.TransactionRepository;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.dto.SubmitTransferRequest;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerRepository ledgerRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    // Standard 1% commission on transfers for fintech demo
    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.01"); 

    @Transactional
    public void transferFunds(Long senderId, SubmitTransferRequest request) {
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be greater than zero");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
                
        if (sender.getKycStatus() != com.fintech.kyc.entity.KycStatus.APPROVED) {
            throw new RuntimeException("Please complete KYC verification to transfer funds.");
        }

        User receiver = userRepository.findByEmail(request.getReceiverEmail())
                .orElseThrow(() -> new RuntimeException("Receiver with email " + request.getReceiverEmail() + " not found"));

        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("Cannot transfer to yourself");
        }

        Wallet senderWallet = walletRepository.findByUserIdForUpdate(sender.getId())
                .orElseThrow(() -> new RuntimeException("Sender wallet not found. Please recharge first."));

        Wallet receiverWallet = walletRepository.findByUserIdForUpdate(receiver.getId())
                .orElseGet(() -> createWalletForUser(receiver));

        BigDecimal commission = request.getAmount().multiply(COMMISSION_RATE);
        BigDecimal totalDeduction = request.getAmount().add(commission);

        if (senderWallet.getBalance().compareTo(totalDeduction) < 0) {
            throw new RuntimeException("Insufficient balance. Total required including 1% commission: ₹" + totalDeduction);
        }

        // Deduct from Sender
        senderWallet.setBalance(senderWallet.getBalance().subtract(totalDeduction));
        walletRepository.save(senderWallet);

        // Add to Receiver
        receiverWallet.setBalance(receiverWallet.getBalance().add(request.getAmount()));
        walletRepository.save(receiverWallet);

        String refNumber = UUID.randomUUID().toString();

        // Transaction Record
        Transaction transaction = Transaction.builder()
                .referenceNumber(refNumber)
                .senderWallet(senderWallet)
                .receiverWallet(receiverWallet)
                .amount(request.getAmount())
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.SUCCESS)
                .description(request.getDescription() != null ? request.getDescription() : "Fund Transfer")
                .build();
        transactionRepository.save(transaction);

        // Commission Transaction Record for visibility (Optional but good)
        Transaction commissionTx = Transaction.builder()
                .referenceNumber(refNumber + "-FEE")
                .senderWallet(senderWallet)
                .amount(commission)
                .type(TransactionType.COMMISSION)
                .status(TransactionStatus.SUCCESS)
                .description("1% Transfer Commission")
                .build();
        transactionRepository.save(commissionTx);

        // System Ledger Entry for Commission
        Ledger ledger = Ledger.builder()
                .amount(commission)
                .type(TransactionType.COMMISSION)
                .referenceNumber(refNumber)
                .description("Commission from transfer: " + sender.getEmail() + " -> " + receiver.getEmail())
                .build();
        ledgerRepository.save(ledger);

        // Notify Sender
        notificationService.createNotification(sender.getId(), 
                "Transfer Successful", 
                "You successfully transferred ₹" + request.getAmount() + " to " + receiver.getEmail() + ". A commission of ₹" + commission + " was deducted.");

        // Notify Receiver
        notificationService.createNotification(receiver.getId(), 
                "Funds Received", 
                "You received ₹" + request.getAmount() + " from " + sender.getEmail() + ".");

        // Send Emails
        emailService.sendTransferEmail(sender.getEmail(), request.getAmount().toString(), receiver.getEmail(), true);
        emailService.sendTransferEmail(receiver.getEmail(), request.getAmount().toString(), sender.getEmail(), false);
    }

    private Wallet createWalletForUser(User user) {
        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .currency("INR")
                .build();
        return walletRepository.save(wallet);
    }
}
