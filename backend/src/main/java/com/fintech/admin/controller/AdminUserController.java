package com.fintech.admin.controller;

import com.fintech.admin.dto.AdminUserDTO;
import com.fintech.admin.dto.CreatePartnerRequest;
import com.fintech.admin.service.AdminUserService;
import com.fintech.common.response.ApiResponse;
import com.fintech.user.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.fintech.admin.dto.HierarchyNodeDto;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserDTO>>> getUsers(Pageable pageable) {
        Page<AdminUserDTO> users = adminUserService.getUsersByRole(Role.USER, pageable)
                .map(u -> AdminUserDTO.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .phone(u.getPhone())
                        .role(u.getRole())
                        .isActive(u.isActive())
                        .kycStatus(u.getKycStatus().name())
                        .createdAt(u.getCreatedAt())
                        .build());
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/partners")
    public ResponseEntity<ApiResponse<Page<AdminUserDTO>>> getPartners(Pageable pageable) {
        Page<AdminUserDTO> partners = adminUserService.getUsersByRole(Role.PARTNER, pageable)
                .map(u -> AdminUserDTO.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .phone(u.getPhone())
                        .role(u.getRole())
                        .partnerType(u.getPartnerType() != null ? u.getPartnerType().name() : null)
                        .parentPartnerId(u.getParentPartnerId())
                        .isActive(u.isActive())
                        .kycStatus(u.getKycStatus().name())
                        .createdAt(u.getCreatedAt())
                        .build());
        return ResponseEntity.ok(ApiResponse.success("Partners retrieved successfully", partners));
    }

    @GetMapping("/hierarchy")
    public ResponseEntity<ApiResponse<List<HierarchyNodeDto>>> getPartnerHierarchy() {
        return ResponseEntity.ok(ApiResponse.success("Hierarchy retrieved", adminUserService.getPartnerHierarchyTree()));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id, @RequestParam boolean active) {
        adminUserService.toggleUserStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", null));
    }

    @PostMapping("/partners")
    public ResponseEntity<ApiResponse<Void>> createPartner(@RequestBody @jakarta.validation.Valid CreatePartnerRequest request) {
        adminUserService.createPartner(request);
        return ResponseEntity.ok(ApiResponse.success("Partner created successfully", null));
    }
}
