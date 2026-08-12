package com.fintech.admin.controller;

import com.fintech.admin.dto.AdminWalletDTO;
import com.fintech.admin.dto.ManualAdjustmentRequestDTO;
import com.fintech.admin.service.AdminWalletService;
import com.fintech.common.response.ApiResponse;
import com.fintech.security.annotation.LogAudit;
import com.fintech.wallet.dto.WalletRechargeRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/wallets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminWalletController {

    private final AdminWalletService adminWalletService;

    @GetMapping
    @LogAudit(action = "VIEW_WALLETS", entityName = "Wallet")
    public ResponseEntity<ApiResponse<Page<AdminWalletDTO>>> getWallets(Pageable pageable) {
        Page<AdminWalletDTO> wallets = adminWalletService.getAllWallets(pageable)
                .map(w -> AdminWalletDTO.builder()
                        .id(w.getId())
                        .userId(w.getUser().getId())
                        .userEmail(w.getUser().getEmail())
                        .fullName(w.getUser().getFullName())
                        .balance(w.getBalance())
                        .currency(w.getCurrency())
                        .build());
        return ResponseEntity.ok(ApiResponse.success("Wallets retrieved successfully", wallets));
    }

    @PostMapping("/{walletId}/adjust")
    @LogAudit(action = "ADJUST_WALLET", entityName = "Wallet")
    public ResponseEntity<ApiResponse<Void>> manualAdjustment(
            @PathVariable Long walletId,
            @RequestBody ManualAdjustmentRequestDTO request) {
        adminWalletService.manualAdjustment(walletId, request);
        return ResponseEntity.ok(ApiResponse.success("Wallet adjusted successfully", null));
    }

    @GetMapping("/recharge-requests")
    @LogAudit(action = "VIEW_RECHARGE_REQUESTS", entityName = "WalletRechargeRequest")
    public ResponseEntity<ApiResponse<List<WalletRechargeRequestDTO>>> getRechargeRequests() {
        List<WalletRechargeRequestDTO> requests = adminWalletService.getAllRechargeRequests();
        return ResponseEntity.ok(ApiResponse.success("Recharge requests retrieved successfully", requests));
    }

    @PostMapping("/recharge-requests/{id}/approve")
    @LogAudit(action = "APPROVE_RECHARGE_REQUEST", entityName = "WalletRechargeRequest")
    public ResponseEntity<ApiResponse<Void>> approveRechargeRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks) {
        adminWalletService.approveRechargeRequest(id, remarks != null ? remarks : "Approved by admin");
        return ResponseEntity.ok(ApiResponse.success("Recharge request approved successfully", null));
    }

    @PostMapping("/recharge-requests/{id}/reject")
    @LogAudit(action = "REJECT_RECHARGE_REQUEST", entityName = "WalletRechargeRequest")
    public ResponseEntity<ApiResponse<Void>> rejectRechargeRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks) {
        adminWalletService.rejectRechargeRequest(id, remarks != null ? remarks : "Rejected by admin");
        return ResponseEntity.ok(ApiResponse.success("Recharge request rejected successfully", null));
    }
}
