package com.fintech.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLedgerResponseDTO {
    private BigDecimal openingBalance;
    private BigDecimal totalCredit;
    private BigDecimal totalDebit;
    private BigDecimal closingBalance;
    
    private List<AdminTransactionDTO> transactions;
}
