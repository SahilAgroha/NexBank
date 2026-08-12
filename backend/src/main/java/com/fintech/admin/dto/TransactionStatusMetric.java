package com.fintech.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionStatusMetric {
    private String status;
    private long count;
    private BigDecimal amount;
}
