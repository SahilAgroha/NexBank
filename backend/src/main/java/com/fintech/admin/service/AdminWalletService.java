package com.fintech.admin.service;

import com.fintech.admin.dto.ManualAdjustmentRequestDTO;
import com.fintech.wallet.dto.WalletRechargeRequestDTO;
import com.fintech.transaction.entity.Transaction;
import com.fintech.transaction.entity.TransactionStatus;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.transaction.repository.TransactionRepository;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.entity.RechargeRequest;
import com.fintech.wallet.entity.RechargeStatus;
import com.fintech.wallet.repository.RechargeRequestRepository;
import com.fintech.wallet.repository.WalletRepository;
import com.fintech.wallet.service.RechargeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminWalletService {

    private final WalletRepository walletRepository;
    private final RechargeRequestRepository rechargeRequestRepository;
    private final TransactionRepository transactionRepository;
    private final RechargeService rechargeService;

    public Page<Wallet> getAllWallets(Pageable pageable) {
        return walletRepository.findAll(pageable);
    }

    @Transactional
    public void manualAdjustment(Long walletId, ManualAdjustmentRequestDTO request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .status(TransactionStatus.SUCCESS)
                .referenceNumber("ADJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .description(request.getRemark())
                .build();

        if (request.getType() == ManualAdjustmentRequestDTO.AdjustmentType.CREDIT) {
            wallet.setBalance(wallet.getBalance().add(request.getAmount()));
            transaction.setType(TransactionType.DEPOSIT);
            transaction.setReceiverWallet(wallet);
        } else {
            if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
                throw new RuntimeException("Insufficient balance for debit adjustment");
            }
            wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
            transaction.setType(TransactionType.WITHDRAWAL);
            transaction.setSenderWallet(wallet);
        }

        walletRepository.save(wallet);
        transactionRepository.save(transaction);
    }

    public List<WalletRechargeRequestDTO> getAllRechargeRequests() {
        return rechargeRequestRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveRechargeRequest(Long id, String remarks) {
        rechargeService.approveRecharge(id, remarks);
    }

    @Transactional
    public void rejectRechargeRequest(Long id, String remarks) {
        rechargeService.rejectRecharge(id, remarks);
    }

    private WalletRechargeRequestDTO mapToDTO(RechargeRequest request) {
        return WalletRechargeRequestDTO.builder()
                .id(request.getId())
                .userId(request.getPartner().getId())
                .userEmail(request.getPartner().getEmail())
                .userName(request.getPartner().getFullName())
                .amount(request.getAmount())
                .referenceNumber(request.getReferenceNumber())
                .transferMode("NEFT/RTGS")
                .status(request.getStatus().name())
                .adminRemarks(request.getAdminRemarks())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
