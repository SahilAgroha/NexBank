package com.fintech.wallet.service;

import com.fintech.common.exception.CustomException;
import com.fintech.transaction.dto.TransactionDTO;
import com.fintech.transaction.entity.Transaction;
import com.fintech.transaction.entity.TransactionStatus;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.transaction.repository.TransactionRepository;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.dto.TransferRequest;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fintech.partner.service.CommissionService;
import com.fintech.ledger.service.LedgerService;
import com.fintech.ledger.entity.LedgerEntryType;
import com.fintech.notification.service.NotificationService;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CommissionService commissionService;
    private final LedgerService ledgerService;
    private final NotificationService notificationService;

    @Transactional
    public void createWalletForUser(User user) {
        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .currency("INR")
                .build();
        walletRepository.save(wallet);
    }

    public BigDecimal getMyBalance(Long userId) {
        return walletRepository.findByUserId(userId)
                .map(Wallet::getBalance)
                .orElseThrow(() -> new CustomException("Wallet not found for user"));
    }

    public List<TransactionDTO> getMyTransactions(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Wallet not found"));

        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId())
                .stream()
                .map(t -> mapToDTO(t, wallet.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionDTO transferFunds(Long senderId, TransferRequest request) {
        Wallet senderWallet = walletRepository.findByUserIdForUpdate(senderId)
                .orElseThrow(() -> new CustomException("Sender wallet not found"));

        if (senderWallet.getUser().getKycStatus() != com.fintech.kyc.entity.KycStatus.APPROVED) {
            throw new CustomException("Please complete KYC verification to transfer money.");
        }

        User receiver = userRepository.findByEmailOrPhone(request.getReceiverIdentifier(), request.getReceiverIdentifier())
                .orElseThrow(() -> new CustomException("Receiver not found"));

        if (senderId.equals(receiver.getId())) {
            throw new CustomException("Cannot transfer money to yourself");
        }

        Wallet receiverWallet = walletRepository.findByUserIdForUpdate(receiver.getId())
                .orElseThrow(() -> new CustomException("Receiver wallet not found"));

        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new CustomException("Insufficient balance");
        }

        // Debit
        BigDecimal senderOpening = senderWallet.getBalance();
        BigDecimal senderClosing = senderOpening.subtract(request.getAmount());
        senderWallet.setBalance(senderClosing);
        walletRepository.save(senderWallet);

        // Credit
        BigDecimal receiverOpening = receiverWallet.getBalance();
        BigDecimal receiverClosing = receiverOpening.add(request.getAmount());
        receiverWallet.setBalance(receiverClosing);
        walletRepository.save(receiverWallet);

        // Record Transaction
        Transaction transaction = Transaction.builder()
                .referenceNumber("TRX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .senderWallet(senderWallet)
                .receiverWallet(receiverWallet)
                .amount(request.getAmount())
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.SUCCESS)
                .description(request.getDescription())
                .build();

        transaction = transactionRepository.save(transaction);
        
        // Record Ledger Entries
        ledgerService.recordEntry(senderWallet, transaction, LedgerEntryType.DEBIT, request.getAmount(), senderOpening, senderClosing, "Transfer to " + receiver.getFullName());
        ledgerService.recordEntry(receiverWallet, transaction, LedgerEntryType.CREDIT, request.getAmount(), receiverOpening, receiverClosing, "Transfer from " + senderWallet.getUser().getFullName());
        
        commissionService.distributeCommission(transaction);
        
        notificationService.createNotification(senderId, "Transfer Successful", "You have successfully transferred ₹" + request.getAmount() + " to " + receiver.getFullName());
        notificationService.createNotification(receiver.getId(), "Money Received", "You have received ₹" + request.getAmount() + " from " + senderWallet.getUser().getFullName());

        return mapToDTO(transaction, senderWallet.getId());
    }

    private TransactionDTO mapToDTO(Transaction t, Long requestingWalletId) {
        boolean isSender = t.getSenderWallet() != null && t.getSenderWallet().getId().equals(requestingWalletId);
        
        String senderName = t.getSenderWallet() != null ? t.getSenderWallet().getUser().getFullName() : "System";
        String receiverName = t.getReceiverWallet() != null ? t.getReceiverWallet().getUser().getFullName() : "System";
        
        // If the requesting user is the sender, it's a debit (negative visually), else credit.
        // We can just return the raw data and let frontend handle visual +/-, but we'll include type.
        
        return TransactionDTO.builder()
                .referenceNumber(t.getReferenceNumber())
                .amount(t.getAmount())
                .type(t.getType().name())
                .status(t.getStatus().name())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .senderName(senderName)
                .receiverName(receiverName)
                .build();
    }

    @Transactional
    public TransactionDTO rechargeWallet(Long userId, com.fintech.wallet.dto.RechargeRequest request) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new CustomException("Wallet not found"));

        // Credit
        BigDecimal opening = wallet.getBalance();
        BigDecimal closing = opening.add(request.getAmount());
        wallet.setBalance(closing);
        walletRepository.save(wallet);

        // Record Transaction
        Transaction transaction = Transaction.builder()
                .referenceNumber("RCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .senderWallet(null) // System/External is the sender
                .receiverWallet(wallet)
                .amount(request.getAmount())
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.SUCCESS)
                .description("Wallet Recharge via " + (request.getPaymentMethod() != null ? request.getPaymentMethod() : "System"))
                .build();

        transaction = transactionRepository.save(transaction);
        
        // Record Ledger Entry
        ledgerService.recordEntry(wallet, transaction, LedgerEntryType.CREDIT, request.getAmount(), opening, closing, transaction.getDescription());
        
        
        return mapToDTO(transaction, wallet.getId());
    }
}
