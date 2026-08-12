package com.fintech.email.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your FinTech Verification Code");
            message.setText("Welcome to FinTech! Your verification code is: " + otpCode + 
                "\nThis code will expire in 10 minutes.");

            mailSender.send(message);
        } catch (Exception e) {
            // In a production app, we might throw an error or use a retry queue.
            // For now, we will log it.
            System.err.println("Failed to send email to " + toEmail + ". Error: " + e.getMessage());
            // We can optionally print the OTP here if the email fails during local dev without an app password
            System.out.println("====== [MOCK EMAIL] OTP for " + toEmail + " is: " + otpCode + " ======");
        }
    }

    public void sendPaymentReceiptEmail(String toEmail, String amount, String referenceNumber) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Payment Receipt - FinTech");
            message.setText("Hello,\n\nWe have successfully received your payment of ₹" + amount + ".\n" +
                    "Transaction Reference: " + referenceNumber + "\n\n" +
                    "Thank you for using FinTech!");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send receipt to " + toEmail + ". Error: " + e.getMessage());
            System.out.println("====== [MOCK RECEIPT] ₹" + amount + " for " + toEmail + " ======");
        }
    }

    public void sendRechargeStatusEmail(String toEmail, String amount, String status, String remarks) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Recharge Request " + status);
            
            String text = "Your recharge request for ₹" + amount + " has been " + status.toLowerCase() + ".\n\n";
            if (remarks != null && !remarks.isEmpty()) {
                text += "Admin Remarks: " + remarks + "\n";
            }
            
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send recharge status to " + toEmail + ". Error: " + e.getMessage());
        }
    }

    public void sendInvoiceEmail(String toEmail, String invoiceNumber, byte[] pdfBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Invoice " + invoiceNumber);
            helper.setText("Please find attached your invoice " + invoiceNumber + ".\n\nThank you for your business!");
            
            helper.addAttachment("Invoice_" + invoiceNumber + ".pdf", new ByteArrayResource(pdfBytes));
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send invoice to " + toEmail + ". Error: " + e.getMessage());
        }
    }

    public void sendTransferEmail(String toEmail, String amount, String senderEmail, boolean isSender) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            
            if (isSender) {
                message.setSubject("Transfer Successful - FinTech");
                message.setText("Hello,\n\nYou have successfully transferred ₹" + amount + " to " + senderEmail + ".\n\nThank you for using FinTech!");
            } else {
                message.setSubject("Funds Received - FinTech");
                message.setText("Hello,\n\nYou have received ₹" + amount + " from " + senderEmail + ".\n\nThank you for using FinTech!");
            }

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send transfer email to " + toEmail + ". Error: " + e.getMessage());
        }
    }
}
