package com.fintech.wallet.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.security.CustomUserDetails;
import com.fintech.wallet.dto.SubmitTransferRequest;
import com.fintech.wallet.service.TransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/partner/transfer")
@RequiredArgsConstructor
public class PartnerTransferController {

    private final TransferService transferService;

    @PostMapping
    public ResponseEntity<ApiResponse<String>> transferFunds(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody SubmitTransferRequest request) {
        
        transferService.transferFunds(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Funds transferred successfully", "SUCCESS"));
    }
}
