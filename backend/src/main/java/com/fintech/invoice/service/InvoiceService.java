package com.fintech.invoice.service;

import com.fintech.email.service.EmailService;
import com.fintech.invoice.dto.InvoiceDTO;
import com.fintech.invoice.dto.InvoiceItemDTO;
import com.fintech.invoice.entity.Invoice;
import com.fintech.invoice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoicePdfGenerator pdfGenerator;
    private final EmailService emailService;

    public Page<InvoiceDTO> getUserInvoices(Long userId, Pageable pageable) {
        return invoiceRepository.findByUserId(userId, pageable).map(this::mapToDTO);
    }

    public Page<InvoiceDTO> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(this::mapToDTO);
    }

    public byte[] downloadInvoicePdf(Long invoiceId, Long userId) throws Exception {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        return pdfGenerator.generateInvoicePdf(invoice);
    }

    public void emailInvoice(Long invoiceId, Long userId) throws Exception {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        byte[] pdfBytes = pdfGenerator.generateInvoicePdf(invoice);
        
        // The email service will need a method that accepts an attachment
        emailService.sendInvoiceEmail(invoice.getUser().getEmail(), invoice.getInvoiceNumber(), pdfBytes);
    }

    private InvoiceDTO mapToDTO(Invoice invoice) {
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .userId(invoice.getUser().getId())
                .userEmail(invoice.getUser().getEmail())
                .subtotal(invoice.getSubtotal())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .items(invoice.getItems().stream().map(item -> InvoiceItemDTO.builder()
                        .id(item.getId())
                        .serviceName(item.getServiceName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
