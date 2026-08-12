package com.fintech.admin.controller;

import com.fintech.admin.dto.AdminLedgerResponseDTO;
import com.fintech.admin.service.AdminFinanceService;
import com.fintech.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/finance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminFinanceController {

    private final AdminFinanceService adminFinanceService;

    @GetMapping("/system-ledger")
    public ResponseEntity<ApiResponse<AdminLedgerResponseDTO>> getSystemLedger(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        AdminLedgerResponseDTO response = adminFinanceService.getSystemLedger(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("System ledger fetched successfully", response));
    }

    @GetMapping("/partner-ledger/{partnerId}")
    public ResponseEntity<ApiResponse<AdminLedgerResponseDTO>> getPartnerLedger(
            @PathVariable Long partnerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        AdminLedgerResponseDTO response = adminFinanceService.getPartnerLedger(partnerId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Partner ledger fetched successfully", response));
    }
}
