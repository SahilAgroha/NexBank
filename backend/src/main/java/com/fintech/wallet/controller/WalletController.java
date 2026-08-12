package com.fintech.wallet.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.security.CustomUserDetails;
import com.fintech.transaction.dto.TransactionDTO;
import com.fintech.wallet.dto.TransferRequest;
import com.fintech.wallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/me/balance")
    public ResponseEntity<ApiResponse<BigDecimal>> getMyBalance(@AuthenticationPrincipal CustomUserDetails userDetails) {
        BigDecimal balance = walletService.getMyBalance(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Balance retrieved successfully", balance));
    }

    @GetMapping("/me/transactions")
    public ResponseEntity<ApiResponse<List<TransactionDTO>>> getMyTransactions(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<TransactionDTO> transactions = walletService.getMyTransactions(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", transactions));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionDTO>> transferFunds(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody TransferRequest request) {
        
        TransactionDTO transaction = walletService.transferFunds(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Transfer successful", transaction));
    }

    @PostMapping("/recharge")
    public ResponseEntity<ApiResponse<TransactionDTO>> rechargeWallet(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody com.fintech.wallet.dto.RechargeRequest request) {
        
        TransactionDTO transaction = walletService.rechargeWallet(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Wallet recharged successfully", transaction));
    }
}
