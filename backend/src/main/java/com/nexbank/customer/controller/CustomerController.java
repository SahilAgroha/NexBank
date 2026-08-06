package com.nexbank.customer.controller;

import com.nexbank.common.response.ApiResponse;
import com.nexbank.customer.dto.*;
import com.nexbank.customer.service.CustomerService;
import com.nexbank.customer.service.KycService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Customer", description = "Customer profile and KYC management")
@SecurityRequirement(name = "bearerAuth")
public class CustomerController {

    private final CustomerService customerService;
    private final KycService kycService;

    @GetMapping("/me")
    @Operation(summary = "Get my profile")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.success(customerService.getMyProfile()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update my profile")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateProfile(request)));
    }

    @PutMapping("/me/address")
    @Operation(summary = "Update my address")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> updateAddress(
            @Valid @RequestBody AddressDto dto) {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateAddress(dto)));
    }

    @PutMapping("/me/nominee")
    @Operation(summary = "Update my nominee")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> updateNominee(
            @RequestBody NomineeDto dto) {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateNominee(dto)));
    }

    @PostMapping(value = "/me/kyc", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload KYC document")
    public ResponseEntity<ApiResponse<String>> uploadKyc(
            @RequestParam String documentType,
            @RequestParam MultipartFile file) throws IOException {
        var doc = kycService.uploadDocument(documentType, file);
        return ResponseEntity.ok(ApiResponse.success("KYC document uploaded", doc.getId()));
    }

    @GetMapping("/me/kyc")
    @Operation(summary = "Get my KYC documents")
    public ResponseEntity<ApiResponse<?>> getKycDocuments() {
        return ResponseEntity.ok(ApiResponse.success(kycService.getMyDocuments()));
    }
}
