package com.fintech.wallet.service;

import com.fintech.common.exception.CustomException;
import com.fintech.email.service.EmailService;
import com.fintech.transaction.entity.Ledger;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.transaction.repository.LedgerRepository;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.entity.PaymentAttempt;
import com.fintech.wallet.repository.PaymentAttemptRepository;
import com.fintech.wallet.dto.RechargeRequest;
import com.fintech.wallet.dto.VerifyPaymentRequest;
import com.fintech.wallet.dto.FailPaymentRequest;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${spring.razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${spring.razorpay.key.secret}")
    private String razorpayKeySecret;

    private final WalletService walletService;
    private final LedgerRepository ledgerRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;

    @Transactional
    public String createOrder(Long userId, BigDecimal amount) throws Exception {
        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        // Razorpay accepts amount in paise (multiply by 100)
        orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = razorpay.orders.create(orderRequest);
        String orderId = order.get("id");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found"));

        if (user.getKycStatus() != com.fintech.kyc.entity.KycStatus.APPROVED) {
            throw new CustomException("Please complete KYC verification to add money.");
        }

        PaymentAttempt attempt = PaymentAttempt.builder()
                .user(user)
                .orderId(orderId)
                .amount(amount)
                .status("PENDING")
                .build();
        paymentAttemptRepository.save(attempt);

        return orderId;
    }

    @Transactional
    public void verifyPayment(Long userId, VerifyPaymentRequest request, BigDecimal amount) throws Exception {
        // Verify Razorpay signature
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", request.getRazorpayOrderId());
        options.put("razorpay_payment_id", request.getRazorpayPaymentId());
        options.put("razorpay_signature", request.getRazorpaySignature());

        boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

        if (!isValid) {
            throw new CustomException("Invalid payment signature");
        }

        // Fetch Payment details to get method
        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        Payment payment = razorpay.payments.fetch(request.getRazorpayPaymentId());
        String method = payment.get("method");

        // Update Payment Attempt
        paymentAttemptRepository.findByOrderId(request.getRazorpayOrderId()).ifPresent(attempt -> {
            attempt.setStatus("SUCCESS");
            attempt.setPaymentId(request.getRazorpayPaymentId());
            attempt.setPaymentMethod(method);
            paymentAttemptRepository.save(attempt);
        });

        // 1. Update Wallet
        RechargeRequest rechargeReq = new RechargeRequest();
        rechargeReq.setAmount(amount);
        rechargeReq.setPaymentMethod(method != null ? method.toUpperCase() : "RAZORPAY");
        walletService.rechargeWallet(userId, rechargeReq);

        // 2. Create Ledger Entry
        Ledger ledger = Ledger.builder()
                .amount(amount)
                .type(TransactionType.DEPOSIT)
                .referenceNumber(request.getRazorpayPaymentId())
                .description("Razorpay Deposit (" + method + ")")
                .build();
        ledgerRepository.save(ledger);

        // 3. Send Email Receipt
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found"));
        emailService.sendPaymentReceiptEmail(user.getEmail(), amount.toString(), request.getRazorpayPaymentId());
    }

    @Transactional
    public void failPayment(FailPaymentRequest request) {
        paymentAttemptRepository.findByOrderId(request.getRazorpayOrderId()).ifPresent(attempt -> {
            attempt.setStatus("FAILED");
            attempt.setPaymentId(request.getRazorpayPaymentId());
            attempt.setPaymentMethod(request.getPaymentMethod());
            attempt.setErrorMessage(request.getErrorMessage());
            paymentAttemptRepository.save(attempt);
        });
    }
}
