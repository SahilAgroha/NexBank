package com.nexbank.beneficiary.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddBeneficiaryRequest {
    @NotBlank private String name;
    @NotBlank private String accountNumber;
    private String ifscCode;
    private String bankName;
}
