package com.fintech.invoice.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.invoice.dto.InvoiceDTO;
import com.fintech.invoice.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/invoices")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminInvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<InvoiceDTO>>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
            
        Page<InvoiceDTO> invoices = invoiceService.getAllInvoices(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
                
        return ResponseEntity.ok(ApiResponse.success("All invoices fetched successfully", invoices));
    }
}
