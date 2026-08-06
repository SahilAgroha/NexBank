package com.nexbank.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransferRequest {
    @NotBlank private String fromAccountId;
    @NotBlank private String toAccountNumber;
    @NotNull @DecimalMin(value = "1.00") private BigDecimal amount;
    private String description;
    private String idempotencyKey;
    private String beneficiaryId; // Optional — for beneficiary OTP check
}
