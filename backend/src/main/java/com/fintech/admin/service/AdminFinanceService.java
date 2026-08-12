package com.fintech.admin.service;

import com.fintech.admin.dto.AdminLedgerResponseDTO;
import com.fintech.admin.dto.AdminTransactionDTO;
import com.fintech.transaction.entity.Transaction;
import com.fintech.transaction.entity.TransactionStatus;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.transaction.repository.TransactionRepository;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminFinanceService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AdminLedgerResponseDTO getSystemLedger(LocalDateTime startDate, LocalDateTime endDate) {
        List<Transaction> transactions = getTransactionsByDate(startDate, endDate);

        BigDecimal totalCredit = BigDecimal.ZERO;
        BigDecimal totalDebit = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (t.getStatus() != TransactionStatus.SUCCESS) continue;
            
            if (t.getType() == TransactionType.DEPOSIT || t.getType() == TransactionType.RECHARGE) {
                totalCredit = totalCredit.add(t.getAmount());
            } else if (t.getType() == TransactionType.WITHDRAWAL) {
                totalDebit = totalDebit.add(t.getAmount());
            }
        }

        BigDecimal openingBal = BigDecimal.valueOf(100000); 
        BigDecimal closingBal = openingBal.add(totalCredit).subtract(totalDebit);

        return AdminLedgerResponseDTO.builder()
                .openingBalance(openingBal)
                .totalCredit(totalCredit)
                .totalDebit(totalDebit)
                .closingBalance(closingBal)
                .transactions(mapToDTO(transactions))
                .build();
    }

    @Transactional(readOnly = true)
    public AdminLedgerResponseDTO getPartnerLedger(Long partnerId, LocalDateTime startDate, LocalDateTime endDate) {
        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        Wallet wallet = walletRepository.findByUserId(partnerId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        List<Transaction> transactions = transactionRepository.findBySenderWalletIdOrReceiverWalletId(wallet.getId(), wallet.getId());

        if (startDate != null) {
            transactions = transactions.stream().filter(t -> !t.getCreatedAt().isBefore(startDate)).collect(Collectors.toList());
        }
        if (endDate != null) {
            transactions = transactions.stream().filter(t -> !t.getCreatedAt().isAfter(endDate)).collect(Collectors.toList());
        }

        BigDecimal totalCredit = BigDecimal.ZERO;
        BigDecimal totalDebit = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (t.getStatus() != TransactionStatus.SUCCESS) continue;
            
            if (t.getReceiverWallet() != null && t.getReceiverWallet().getId().equals(wallet.getId())) {
                totalCredit = totalCredit.add(t.getAmount());
            }
            if (t.getSenderWallet() != null && t.getSenderWallet().getId().equals(wallet.getId())) {
                totalDebit = totalDebit.add(t.getAmount());
            }
        }

        return AdminLedgerResponseDTO.builder()
                .openingBalance(wallet.getBalance().subtract(totalCredit).add(totalDebit))
                .totalCredit(totalCredit)
                .totalDebit(totalDebit)
                .closingBalance(wallet.getBalance())
                .transactions(mapToDTO(transactions))
                .build();
    }

    private List<Transaction> getTransactionsByDate(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return transactionRepository.findAll().stream()
                    .filter(t -> !t.getCreatedAt().isBefore(startDate) && !t.getCreatedAt().isAfter(endDate))
                    .collect(Collectors.toList());
        }
        return transactionRepository.findAll();
    }

    private List<AdminTransactionDTO> mapToDTO(List<Transaction> transactions) {
        return transactions.stream().map(t -> AdminTransactionDTO.builder()
                .id(t.getId())
                .referenceNumber(t.getReferenceNumber())
                .senderWalletId(t.getSenderWallet() != null ? t.getSenderWallet().getId() : null)
                .senderEmail((t.getSenderWallet() != null && t.getSenderWallet().getUser() != null) ? t.getSenderWallet().getUser().getEmail() : null)
                .receiverWalletId(t.getReceiverWallet() != null ? t.getReceiverWallet().getId() : null)
                .receiverEmail((t.getReceiverWallet() != null && t.getReceiverWallet().getUser() != null) ? t.getReceiverWallet().getUser().getEmail() : null)
                .amount(t.getAmount())
                .type(t.getType().name())
                .status(t.getStatus().name())
                .createdAt(t.getCreatedAt())
                .build()).collect(Collectors.toList());
    }
}
