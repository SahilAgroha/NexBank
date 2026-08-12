package com.fintech.invoice.dto;

import com.fintech.invoice.entity.InvoiceStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class InvoiceDTO {
    private Long id;
    private String invoiceNumber;
    private Long userId;
    private String userEmail;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private LocalDateTime createdAt;
    private List<InvoiceItemDTO> items;
}
