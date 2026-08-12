package com.fintech.ledger.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.ledger.dto.LedgerEntryDTO;
import com.fintech.ledger.entity.LedgerEntryType;
import com.fintech.ledger.service.LedgerService;
import com.fintech.security.CustomUserDetails;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.WalletRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;
    private final WalletRepository walletRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LedgerEntryDTO>>> getMyLedger(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) LedgerEntryType type,
            Pageable pageable) {

        Wallet wallet = walletRepository.findByUserId(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        Page<LedgerEntryDTO> ledgerPage = ledgerService.getLedgerEntries(wallet.getId(), startDate, endDate, type, pageable)
                .map(entry -> LedgerEntryDTO.builder()
                        .id(entry.getId())
                        .referenceNumber(entry.getTransaction().getReferenceNumber())
                        .type(entry.getType().name())
                        .amount(entry.getAmount())
                        .openingBalance(entry.getOpeningBalance())
                        .closingBalance(entry.getClosingBalance())
                        .description(entry.getDescription())
                        .createdAt(entry.getCreatedAt())
                        .build());

        return ResponseEntity.ok(ApiResponse.success("Ledger retrieved successfully", ledgerPage));
    }

    @GetMapping("/export")
    public void exportMyLedgerCsv(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) LedgerEntryType type,
            HttpServletResponse response) throws IOException {

        Wallet wallet = walletRepository.findByUserId(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"ledger_" + userDetails.getUser().getId() + ".csv\"");

        ledgerService.exportLedgerToCsv(response.getWriter(), wallet.getId(), startDate, endDate, type);
    }
}
