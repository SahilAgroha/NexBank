package com.nexbank.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DepositRequest {
    @NotBlank private String accountId;
    @NotNull @DecimalMin(value = "1.00", message = "Minimum deposit is ₹1")
    private BigDecimal amount;
    private String description;
    private String idempotencyKey;
}
