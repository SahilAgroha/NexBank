package com.fintech.wallet.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.security.annotation.LogAudit;
import com.fintech.wallet.dto.RechargeRequestDTO;
import com.fintech.wallet.entity.RechargeStatus;
import com.fintech.wallet.service.RechargeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/recharges")
@RequiredArgsConstructor
public class AdminRechargeController {

    private final RechargeService rechargeService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RechargeRequestDTO>>> getAllRecharges(
            @RequestParam(required = false) RechargeStatus status,
            Pageable pageable) {
        
        Page<RechargeRequestDTO> response = rechargeService.getAllRecharges(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Recharges fetched successfully", response));
    }

    @PostMapping("/{id}/approve")
    @LogAudit(action = "APPROVE_RECHARGE", entityName = "RechargeRequest")
    public ResponseEntity<ApiResponse<RechargeRequestDTO>> approveRecharge(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Approved") String remarks) {
        
        RechargeRequestDTO response = rechargeService.approveRecharge(id, remarks);
        return ResponseEntity.ok(ApiResponse.success("Recharge approved successfully", response));
    }

    @PostMapping("/{id}/reject")
    @LogAudit(action = "REJECT_RECHARGE", entityName = "RechargeRequest")
    public ResponseEntity<ApiResponse<RechargeRequestDTO>> rejectRecharge(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Rejected") String remarks) {
        
        RechargeRequestDTO response = rechargeService.rejectRecharge(id, remarks);
        return ResponseEntity.ok(ApiResponse.success("Recharge rejected successfully", response));
    }
}
