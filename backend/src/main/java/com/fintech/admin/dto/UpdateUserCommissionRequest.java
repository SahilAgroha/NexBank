package com.fintech.admin.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateUserCommissionRequest {
    private Long serviceId;
    private String yieldType; // PERCENTAGE, FLAT
    private BigDecimal yieldValue;
    private boolean isActive;
}
