package com.fintech.admin.controller;

import com.fintech.admin.dto.AdminTransactionDTO;
import com.fintech.admin.service.AdminTransactionService;
import com.fintech.common.response.ApiResponse;
import com.fintech.transaction.entity.TransactionStatus;
import com.fintech.transaction.entity.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/transactions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTransactionController {

    private final AdminTransactionService adminTransactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminTransactionDTO>>> getTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        
        Page<AdminTransactionDTO> transactions = adminTransactionService.getAllTransactions(startDate, endDate, status, type, search, pageable)
                .map(t -> AdminTransactionDTO.builder()
                        .id(t.getId())
                        .referenceNumber(t.getReferenceNumber())
                        .senderWalletId(t.getSenderWallet() != null ? t.getSenderWallet().getId() : null)
                        .senderEmail((t.getSenderWallet() != null && t.getSenderWallet().getUser() != null) ? t.getSenderWallet().getUser().getEmail() : null)
                        .receiverWalletId(t.getReceiverWallet() != null ? t.getReceiverWallet().getId() : null)
                        .receiverEmail((t.getReceiverWallet() != null && t.getReceiverWallet().getUser() != null) ? t.getReceiverWallet().getUser().getEmail() : null)
                        .amount(t.getAmount())
                        .type(t.getType().name())
                        .status(t.getStatus().name())
                        .description(t.getDescription())
                        .createdAt(t.getCreatedAt())
                        .build());
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", transactions));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveTransaction(@PathVariable Long id) {
        adminTransactionService.approveTransaction(id);
        return ResponseEntity.ok(ApiResponse.success("Transaction approved successfully", null));
    }
}
