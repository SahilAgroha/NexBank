package com.fintech.admin.controller;

import com.fintech.admin.dto.*;
import com.fintech.admin.service.AdminUserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserManagementController {

    private final AdminUserManagementService adminUserManagementService;

    @GetMapping("/{userId}/details")
    public ResponseEntity<AdminUserDetailsResponse> getUserDetails(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserManagementService.getUserDetails(userId));
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<Void> updateUserProfile(@PathVariable Long userId, @RequestBody UpdateUserProfileRequest request) {
        adminUserManagementService.updateUserProfile(userId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/finance")
    public ResponseEntity<Void> updateUserFinance(@PathVariable Long userId, @RequestBody UpdateUserFinanceRequest request) {
        adminUserManagementService.updateUserFinance(userId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/services")
    public ResponseEntity<Void> updateUserService(@PathVariable Long userId, @RequestBody UpdateUserServiceRequest request) {
        adminUserManagementService.updateUserServiceAuthorization(userId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/commissions")
    public ResponseEntity<Void> updateUserCommission(@PathVariable Long userId, @RequestBody UpdateUserCommissionRequest request) {
        adminUserManagementService.updateUserCommission(userId, request);
        return ResponseEntity.ok().build();
    }
}
