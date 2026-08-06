package com.nexbank.payment.controller;

import com.nexbank.common.response.ApiResponse;
import com.nexbank.payment.entity.Payment;
import com.nexbank.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Payments", description = "UPI, QR, Merchant and Razorpay payments")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/upi")
    @Operation(summary = "Make UPI payment")
    public ResponseEntity<ApiResponse<Payment>> upiPay(
            @RequestParam String fromAccountId,
            @RequestParam String upiId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(ApiResponse.success("UPI payment successful",
                paymentService.processUpiPayment(fromAccountId, upiId, amount, description)));
    }

    @PostMapping("/qr")
    @Operation(summary = "Make QR payment")
    public ResponseEntity<ApiResponse<Payment>> qrPay(
            @RequestParam String fromAccountId,
            @RequestParam String qrData,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(ApiResponse.success("QR payment successful",
                paymentService.processQrPayment(fromAccountId, qrData, amount)));
    }

    @PostMapping("/razorpay/order")
    @Operation(summary = "Create Razorpay order")
    public ResponseEntity<ApiResponse<Payment>> createRazorpayOrder(
            @RequestParam String fromAccountId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(ApiResponse.success("Razorpay order created",
                paymentService.createRazorpayOrder(fromAccountId, amount, description)));
    }

    @PostMapping("/razorpay/verify")
    @Operation(summary = "Verify Razorpay payment")
    public ResponseEntity<ApiResponse<Payment>> verifyRazorpay(
            @RequestParam String razorpayOrderId,
            @RequestParam String razorpayPaymentId,
            @RequestParam String razorpaySignature) {
        return ResponseEntity.ok(ApiResponse.success("Payment verified",
                paymentService.verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature)));
    }

    @GetMapping("/account/{accountId}")
    @Operation(summary = "Get payment history")
    public ResponseEntity<ApiResponse<Page<Payment>>> getHistory(
            @PathVariable String accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getPaymentHistory(accountId, PageRequest.of(page, size))));
    }
}
