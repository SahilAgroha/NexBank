package com.fintech.admin.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ManualAdjustmentRequestDTO {
    private BigDecimal amount;
    private AdjustmentType type;
    private String remark;

    public enum AdjustmentType {
        CREDIT,
        DEBIT
    }
}
