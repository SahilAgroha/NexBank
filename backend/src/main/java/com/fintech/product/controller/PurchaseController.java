package com.fintech.product.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.invoice.entity.Invoice;
import com.fintech.product.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.fintech.user.repository.UserRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;
    private final UserRepository userRepository;

    @PostMapping("/{productId}/purchase")
    public ResponseEntity<ApiResponse<Map<String, Long>>> purchaseProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") Integer quantity,
            @AuthenticationPrincipal UserDetails userDetails) {
            
        Long userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
                
        Invoice invoice = purchaseService.purchaseService(userId, productId, quantity);
        
        return ResponseEntity.ok(ApiResponse.success("Purchase successful", Map.of("invoiceId", invoice.getId())));
    }
}
