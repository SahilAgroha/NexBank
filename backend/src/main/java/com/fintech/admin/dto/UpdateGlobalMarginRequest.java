package com.fintech.admin.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateGlobalMarginRequest {
    private Long serviceProductId;
    private String marginType;
    private BigDecimal amount;
}
