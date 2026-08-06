package com.nexbank.payment.entity;

import com.nexbank.common.entity.BaseEntity;
import com.nexbank.common.enums.PaymentType;
import com.nexbank.common.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "payments")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Payment extends BaseEntity {

    @Column(name = "from_account_id", nullable = false, length = 36)
    private String fromAccountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    private PaymentType paymentType;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(name = "merchant_id", length = 100)
    private String merchantId;

    @Column(name = "upi_id", length = 100)
    private String upiId;

    @Column(name = "qr_data", length = 500)
    private String qrData;

    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;

    @Column(name = "reference", nullable = false, length = 50)
    private String reference;

    @Column(name = "description", length = 255)
    private String description;
}
