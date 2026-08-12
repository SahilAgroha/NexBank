package com.fintech.wallet.service;

import com.fintech.email.service.EmailService;
import com.fintech.notification.service.NotificationService;
import com.fintech.transaction.entity.Ledger;
import com.fintech.transaction.entity.Transaction;
import com.fintech.transaction.entity.TransactionStatus;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.transaction.repository.LedgerRepository;
import com.fintech.transaction.repository.TransactionRepository;
import com.fintech.ledger.service.LedgerService;
import com.fintech.ledger.entity.LedgerEntryType;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.dto.RechargeRequestDTO;
import com.fintech.wallet.dto.SubmitRechargeRequest;
import com.fintech.wallet.entity.RechargeRequest;
import com.fintech.wallet.entity.RechargeStatus;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.RechargeRequestRepository;
import com.fintech.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RechargeService {

    private final RechargeRequestRepository rechargeRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerRepository ledgerRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final LedgerService ledgerService;

    @Transactional
    public RechargeRequestDTO submitRechargeRequest(Long partnerId, SubmitRechargeRequest request) {
        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        RechargeRequest rechargeRequest = RechargeRequest.builder()
                .partner(partner)
                .amount(request.getAmount())
                .referenceNumber(request.getReferenceNumber())
                .status(RechargeStatus.PENDING)
                .build();

        rechargeRepository.save(rechargeRequest);

        // Notify admins asynchronously (in a real app, send email/slack)

        return mapToDTO(rechargeRequest);
    }

    public Page<RechargeRequestDTO> getPartnerRecharges(Long partnerId, Pageable pageable) {
        return rechargeRepository.findByPartnerId(partnerId, pageable).map(this::mapToDTO);
    }

    public Page<RechargeRequestDTO> getAllRecharges(RechargeStatus status, Pageable pageable) {
        if (status != null) {
            return rechargeRepository.findByStatus(status, pageable).map(this::mapToDTO);
        }
        return rechargeRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Transactional
    public RechargeRequestDTO approveRecharge(Long requestId, String adminRemarks) {
        RechargeRequest request = rechargeRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Recharge request not found"));

        if (request.getStatus() == RechargeStatus.APPROVED) {
            request.setAdminRemarks(adminRemarks);
            rechargeRepository.save(request);
            return mapToDTO(request);
        }

        request.setStatus(RechargeStatus.APPROVED);
        request.setAdminRemarks(adminRemarks);
        rechargeRepository.save(request);

        User partner = request.getPartner();
        Wallet wallet = walletRepository.findByUserIdForUpdate(partner.getId())
                .orElseGet(() -> createWalletForUser(partner));

        // Update Wallet
        if (wallet.getBalance() == null) {
            wallet.setBalance(BigDecimal.ZERO);
        }
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        String refNum = request.getReferenceNumber() != null ? request.getReferenceNumber() : UUID.randomUUID().toString();

        // Create Ledger Entry
        Ledger ledger = Ledger.builder()
                .amount(request.getAmount())
                .type(TransactionType.DEPOSIT)
                .referenceNumber(refNum)
                .description("Partner Wallet Recharge - Request ID: " + request.getId())
                .build();
        ledgerRepository.save(ledger);

        // Create Transaction
        Transaction transaction = Transaction.builder()
                .referenceNumber(UUID.randomUUID().toString())
                .receiverWallet(wallet)
                .amount(request.getAmount())
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.SUCCESS)
                .description("Wallet Recharge Approved. Ref: " + refNum)
                .build();
        transaction = transactionRepository.save(transaction);

        // Record User Ledger Entry
        BigDecimal openingBalance = wallet.getBalance().subtract(request.getAmount());
        ledgerService.recordEntry(
                wallet, 
                transaction, 
                LedgerEntryType.CREDIT, 
                request.getAmount(), 
                openingBalance, 
                wallet.getBalance(), 
                "Wallet Recharge Approved. Ref: " + refNum
        );

        // Notify Partner
        notificationService.createNotification(partner.getId(), 
            "Recharge Approved", 
            "Your recharge request of ₹" + request.getAmount() + " has been approved and credited to your wallet.");
        
        emailService.sendRechargeStatusEmail(partner.getEmail(), request.getAmount().toString(), "APPROVED", adminRemarks);

        return mapToDTO(request);
    }

    @Transactional
    public RechargeRequestDTO rejectRecharge(Long requestId, String adminRemarks) {
        RechargeRequest request = rechargeRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Recharge request not found"));

        if (request.getStatus() == RechargeStatus.REJECTED) {
            request.setAdminRemarks(adminRemarks);
            rechargeRepository.save(request);
            return mapToDTO(request);
        }

        // If reversing an APPROVED state, deduct from wallet
        if (request.getStatus() == RechargeStatus.APPROVED) {
            User partner = request.getPartner();
            walletRepository.findByUserIdForUpdate(partner.getId()).ifPresent(wallet -> {
                if (wallet.getBalance() == null) wallet.setBalance(BigDecimal.ZERO);
                wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
                walletRepository.save(wallet);
                
                String refNum = request.getReferenceNumber() != null ? request.getReferenceNumber() + "-REV" : UUID.randomUUID().toString();
                
                Ledger ledger = Ledger.builder()
                        .amount(request.getAmount().negate())
                        .type(TransactionType.WITHDRAWAL)
                        .referenceNumber(refNum)
                        .description("Recharge Reversal - Request ID: " + request.getId())
                        .build();
                ledgerRepository.save(ledger);

                Transaction transaction = Transaction.builder()
                        .referenceNumber(UUID.randomUUID().toString())
                        .senderWallet(wallet) // Deduced from sender wallet
                        .amount(request.getAmount())
                        .type(TransactionType.WITHDRAWAL)
                        .status(TransactionStatus.SUCCESS)
                        .description("Recharge Reversed. Ref: " + refNum)
                        .build();
                transactionRepository.save(transaction);
            });
        }

        request.setStatus(RechargeStatus.REJECTED);
        request.setAdminRemarks(adminRemarks);
        rechargeRepository.save(request);

        // Notify Partner
        notificationService.createNotification(request.getPartner().getId(), 
            "Recharge Rejected", 
            "Your recharge request of ₹" + request.getAmount() + " was rejected. Reason: " + adminRemarks);

        emailService.sendRechargeStatusEmail(request.getPartner().getEmail(), request.getAmount().toString(), "REJECTED", adminRemarks);

        return mapToDTO(request);
    }

    private Wallet createWalletForUser(User user) {
        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .currency("INR")
                .build();
        return walletRepository.save(wallet);
    }

    private RechargeRequestDTO mapToDTO(RechargeRequest request) {
        return RechargeRequestDTO.builder()
                .id(request.getId())
                .partnerId(request.getPartner().getId())
                .partnerEmail(request.getPartner().getEmail())
                .amount(request.getAmount())
                .referenceNumber(request.getReferenceNumber())
                .status(request.getStatus())
                .adminRemarks(request.getAdminRemarks())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
