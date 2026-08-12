package com.fintech.invoice.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.invoice.dto.InvoiceDTO;
import com.fintech.invoice.service.InvoiceService;
import com.fintech.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<InvoiceDTO>>> getMyInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
            
        Long userId = getUserId(userDetails);
        Page<InvoiceDTO> invoices = invoiceService.getUserInvoices(userId, 
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
                
        return ResponseEntity.ok(ApiResponse.success("Invoices fetched successfully", invoices));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadInvoice(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {
            
        Long userId = getUserId(userDetails);
        byte[] pdfBytes = invoiceService.downloadInvoicePdf(id, userId);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"invoice_" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
    
    @PostMapping("/{id}/email")
    public ResponseEntity<ApiResponse<Void>> emailInvoice(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {
            
        Long userId = getUserId(userDetails);
        invoiceService.emailInvoice(id, userId);
        
        return ResponseEntity.ok(ApiResponse.success("Invoice emailed successfully", null));
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
