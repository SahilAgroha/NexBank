package com.nexbank.beneficiary.controller;

import com.nexbank.beneficiary.dto.AddBeneficiaryRequest;
import com.nexbank.beneficiary.dto.BeneficiaryDto;
import com.nexbank.beneficiary.service.BeneficiaryService;
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
@RequestMapping("/beneficiaries")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Beneficiaries", description = "Manage transfer beneficiaries")
@SecurityRequirement(name = "bearerAuth")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @PostMapping
    @Operation(summary = "Add a new beneficiary")
    public ResponseEntity<ApiResponse<BeneficiaryDto>> addBeneficiary(
            @Valid @RequestBody AddBeneficiaryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Beneficiary added. Please verify via OTP sent to your email.",
                        beneficiaryService.addBeneficiary(request)));
    }

    @PostMapping("/{id}/verify")
    @Operation(summary = "Verify beneficiary with OTP")
    public ResponseEntity<ApiResponse<BeneficiaryDto>> verify(
            @PathVariable String id, @RequestParam String otp) {
        return ResponseEntity.ok(ApiResponse.success("Beneficiary verified",
                beneficiaryService.verifyBeneficiary(id, otp)));
    }

    @GetMapping
    @Operation(summary = "Get my beneficiaries")
    public ResponseEntity<ApiResponse<List<BeneficiaryDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(beneficiaryService.getMyBeneficiaries()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a beneficiary")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        beneficiaryService.deleteBeneficiary(id);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary deleted"));
    }
}
