package com.fintech.partner.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.partner.dto.CustomerInfo;
import com.fintech.partner.dto.HierarchyNode;
import com.fintech.partner.dto.PartnerDashboardResponse;
import com.fintech.partner.service.PartnerService;
import com.fintech.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARTNER')")
public class PartnerController {

    private final PartnerService partnerService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<PartnerDashboardResponse>> getDashboardStats(@AuthenticationPrincipal CustomUserDetails userDetails) {
        PartnerDashboardResponse stats = partnerService.getDashboardStats(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched", stats));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<CustomerInfo>>> getCustomers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<CustomerInfo> customers = partnerService.getCustomers(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Customers fetched", customers));
    }

    @GetMapping("/hierarchy")
    public ResponseEntity<ApiResponse<HierarchyNode>> getHierarchy(@AuthenticationPrincipal CustomUserDetails userDetails) {
        HierarchyNode hierarchy = partnerService.getHierarchy(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Hierarchy fetched", hierarchy));
    }
}
