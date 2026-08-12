package com.fintech.wallet.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SubmitRechargeRequest {
    private BigDecimal amount;
    private String referenceNumber;
}
