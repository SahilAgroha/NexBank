package com.fintech.wallet.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SubmitTransferRequest {
    private String receiverEmail;
    private BigDecimal amount;
    private String description;
}
