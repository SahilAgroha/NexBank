package com.fintech.wallet.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.security.CustomUserDetails;
import com.fintech.wallet.dto.CreateOrderRequest;
import com.fintech.wallet.dto.VerifyPaymentRequest;
import com.fintech.wallet.dto.FailPaymentRequest;
import com.fintech.wallet.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<Map<String, String>>> createOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        try {
            String orderId = paymentService.createOrder(userDetails.getUser().getId(), request.getAmount());
            return ResponseEntity.ok(ApiResponse.success("Order created", Map.of("orderId", orderId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("amount") java.math.BigDecimal amount,
            @Valid @RequestBody VerifyPaymentRequest request) {
        try {
            paymentService.verifyPayment(userDetails.getUser().getId(), request, amount);
            return ResponseEntity.ok(ApiResponse.success("Payment verified and wallet recharged", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Verification failed: " + e.getMessage()));
        }
    }

    @PostMapping("/fail")
    public ResponseEntity<ApiResponse<String>> failPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody FailPaymentRequest request) {
        try {
            paymentService.failPayment(request);
            return ResponseEntity.ok(ApiResponse.success("Failed payment logged", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to log payment error: " + e.getMessage()));
        }
    }
}
