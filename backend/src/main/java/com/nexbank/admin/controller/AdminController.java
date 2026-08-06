package com.nexbank.admin.controller;

import com.nexbank.account.entity.Account;
import com.nexbank.admin.service.AdminService;
import com.nexbank.common.enums.KycStatus;
import com.nexbank.common.response.ApiResponse;
import com.nexbank.common.response.PageResponse;
import com.nexbank.customer.entity.Customer;
import com.nexbank.fraud.entity.FraudAlert;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/customers")
    @Operation(summary = "Get all customers")
    public ResponseEntity<ApiResponse<PageResponse<Customer>>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(adminService.getAllCustomers(PageRequest.of(page, size)))));
    }

    @GetMapping("/customers/{customerId}")
    @Operation(summary = "Get customer details")
    public ResponseEntity<ApiResponse<Customer>> getCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getCustomer(customerId)));
    }

    @PatchMapping("/accounts/{accountId}/freeze")
    @Operation(summary = "Freeze an account")
    public ResponseEntity<ApiResponse<Account>> freeze(
            @PathVariable String accountId,
            @RequestParam(required = false, defaultValue = "Admin action") String reason) {
        return ResponseEntity.ok(ApiResponse.success("Account frozen",
                adminService.freezeAccountByAdmin(accountId, reason)));
    }

    @PatchMapping("/accounts/{accountId}/unfreeze")
    @Operation(summary = "Unfreeze an account")
    public ResponseEntity<ApiResponse<Account>> unfreeze(@PathVariable String accountId) {
        return ResponseEntity.ok(ApiResponse.success("Account unfrozen",
                adminService.unfreezeAccount(accountId)));
    }

    @PatchMapping("/customers/{customerId}/kyc")
    @Operation(summary = "Update KYC status")
    public ResponseEntity<ApiResponse<Customer>> updateKyc(
            @PathVariable String customerId,
            @RequestParam KycStatus status,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.success("KYC status updated",
                adminService.updateKycStatus(customerId, status, reason)));
    }

    @GetMapping("/fraud-alerts")
    @Operation(summary = "Get unresolved fraud alerts")
    public ResponseEntity<ApiResponse<PageResponse<FraudAlert>>> getFraudAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(adminService.getUnresolvedFraudAlerts(PageRequest.of(page, size)))));
    }

    @PatchMapping("/fraud-alerts/{alertId}/resolve")
    @Operation(summary = "Resolve a fraud alert")
    public ResponseEntity<ApiResponse<Void>> resolveAlert(@PathVariable String alertId) {
        adminService.resolveFraudAlert(alertId);
        return ResponseEntity.ok(ApiResponse.success("Fraud alert resolved"));
    }
}
