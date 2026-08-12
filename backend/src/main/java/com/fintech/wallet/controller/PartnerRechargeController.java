package com.fintech.wallet.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.wallet.dto.RechargeRequestDTO;
import com.fintech.wallet.dto.SubmitRechargeRequest;
import com.fintech.wallet.service.RechargeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.fintech.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/partner/recharges")
@RequiredArgsConstructor
public class PartnerRechargeController {

    private final RechargeService rechargeService;

    @PostMapping
    public ResponseEntity<ApiResponse<RechargeRequestDTO>> submitRecharge(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody SubmitRechargeRequest request) {
        
        RechargeRequestDTO response = rechargeService.submitRechargeRequest(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Recharge request submitted successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RechargeRequestDTO>>> getMyRecharges(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable) {
        
        Page<RechargeRequestDTO> response = rechargeService.getPartnerRecharges(userDetails.getUser().getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Recharges fetched successfully", response));
    }
}
