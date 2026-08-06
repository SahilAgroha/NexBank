package com.nexbank.account.controller;

import com.nexbank.account.dto.AccountDto;
import com.nexbank.account.dto.CreateAccountRequest;
import com.nexbank.account.service.AccountService;
import com.nexbank.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Accounts", description = "Account management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @Operation(summary = "Open a new account")
    public ResponseEntity<ApiResponse<AccountDto>> createAccount(
            @Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully",
                        accountService.createAccount(request)));
    }

    @GetMapping
    @Operation(summary = "Get all my accounts")
    public ResponseEntity<ApiResponse<List<AccountDto>>> getMyAccounts() {
        return ResponseEntity.ok(ApiResponse.success(accountService.getMyAccounts()));
    }

    @GetMapping("/{accountId}")
    @Operation(summary = "Get account details")
    public ResponseEntity<ApiResponse<AccountDto>> getAccount(@PathVariable String accountId) {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAccount(accountId)));
    }

    @PatchMapping("/{accountId}/freeze")
    @Operation(summary = "Freeze account")
    public ResponseEntity<ApiResponse<AccountDto>> freezeAccount(@PathVariable String accountId) {
        return ResponseEntity.ok(ApiResponse.success("Account frozen", accountService.freezeAccount(accountId)));
    }
}
