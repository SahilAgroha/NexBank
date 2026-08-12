package com.fintech.wallet.dto;

import lombok.Data;

@Data
public class FailPaymentRequest {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String errorMessage;
    private String paymentMethod;
}
