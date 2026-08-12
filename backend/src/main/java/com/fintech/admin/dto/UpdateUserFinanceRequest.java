package com.fintech.admin.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateUserFinanceRequest {
    private String virtualAccount;
    private String virtualIfsc;
    private BigDecimal cappingAmount;
}
