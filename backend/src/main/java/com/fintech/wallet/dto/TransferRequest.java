package com.fintech.wallet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferRequest {
    
    @NotBlank(message = "Receiver identifier (email or phone) is required")
    private String receiverIdentifier;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.0", message = "Minimum transfer amount is 1.0")
    private BigDecimal amount;

    private String description;
}
