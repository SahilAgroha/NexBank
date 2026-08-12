package com.fintech.ledger.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.ledger.dto.LedgerEntryDTO;
import com.fintech.ledger.entity.LedgerEntryType;
import com.fintech.ledger.service.LedgerService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/ledger")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminLedgerController {

    private final LedgerService ledgerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LedgerEntryDTO>>> getSystemLedger(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) LedgerEntryType type,
            Pageable pageable) {

        Page<LedgerEntryDTO> ledgerPage = ledgerService.getSystemLedgerEntries(startDate, endDate, type, pageable)
                .map(entry -> LedgerEntryDTO.builder()
                        .id(entry.getId())
                        .referenceNumber(entry.getTransaction().getReferenceNumber())
                        .type(entry.getType().name())
                        .amount(entry.getAmount())
                        .openingBalance(entry.getOpeningBalance())
                        .closingBalance(entry.getClosingBalance())
                        .description(entry.getDescription())
                        .createdAt(entry.getCreatedAt())
                        .userEmail(entry.getWallet().getUser().getEmail())
                        .walletId(entry.getWallet().getId())
                        .build());

        return ResponseEntity.ok(ApiResponse.success("System Ledger retrieved successfully", ledgerPage));
    }

    @GetMapping("/export")
    public void exportSystemLedgerCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) LedgerEntryType type,
            HttpServletResponse response) throws IOException {

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"system_ledger.csv\"");

        ledgerService.exportSystemLedgerToCsv(response.getWriter(), startDate, endDate, type);
    }
}
