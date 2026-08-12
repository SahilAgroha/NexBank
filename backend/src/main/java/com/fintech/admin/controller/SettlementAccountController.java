package com.fintech.admin.controller;

import com.fintech.admin.dto.MerchantBankAccountResponse;
import com.fintech.admin.service.SettlementAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/settlement-accounts")
@RequiredArgsConstructor
public class SettlementAccountController {

    private final SettlementAccountService service;

    @GetMapping
    public ResponseEntity<List<MerchantBankAccountResponse>> getAllSettlementAccounts() {
        return ResponseEntity.ok(service.getAllSettlementAccounts());
    }

    @GetMapping("/merchant/{merchantId}")
    public ResponseEntity<List<MerchantBankAccountResponse>> getAccountsByMerchant(@PathVariable Long merchantId) {
        return ResponseEntity.ok(service.getAccountsByMerchant(merchantId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MerchantBankAccountResponse> updateAccountStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(service.updateAccountStatus(id, status));
    }
}
