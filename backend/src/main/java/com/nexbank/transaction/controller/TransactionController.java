package com.nexbank.transaction.controller;

import com.nexbank.common.response.ApiResponse;
import com.nexbank.common.response.PageResponse;
import com.nexbank.transaction.dto.*;
import com.nexbank.transaction.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Transactions", description = "Deposit, withdrawal, transfer and history")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    @Operation(summary = "Deposit funds")
    public ResponseEntity<ApiResponse<TransactionDto>> deposit(@Valid @RequestBody DepositRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Deposit successful",
                transactionService.deposit(request)));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw funds")
    public ResponseEntity<ApiResponse<TransactionDto>> withdraw(@Valid @RequestBody WithdrawRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Withdrawal successful",
                transactionService.withdraw(request)));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer funds")
    public ResponseEntity<ApiResponse<TransactionDto>> transfer(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Transfer successful",
                transactionService.transfer(request)));
    }

    @GetMapping("/account/{accountId}")
    @Operation(summary = "Get transaction history for an account")
    public ResponseEntity<ApiResponse<PageResponse<TransactionDto>>> getHistory(
            @PathVariable String accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var result = transactionService.getTransactionHistory(accountId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }
}
