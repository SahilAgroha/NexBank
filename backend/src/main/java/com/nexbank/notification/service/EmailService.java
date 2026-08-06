package com.nexbank.notification.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final SendGrid sendGrid;

    @Value("${sendgrid.from-email}")
    private String fromEmail;

    @Value("${sendgrid.from-name}")
    private String fromName;

    @Async
    public void sendOtpEmail(String toEmail, String firstName, String otp, String purpose) {
        String subject = "NexBank — Your " + purpose + " OTP";
        String body = buildOtpEmailHtml(firstName, otp, purpose);
        send(toEmail, subject, body);
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        String subject = "Welcome to NexBank, " + firstName + "! 🎉";
        String body = buildWelcomeEmailHtml(firstName);
        send(toEmail, subject, body);
    }

    @Async
    public void sendPasswordChangedEmail(String toEmail, String firstName) {
        String subject = "NexBank — Password Changed Successfully";
        String body = "<h2>Hi " + firstName + ",</h2><p>Your NexBank password has been changed successfully.</p>"
                + "<p>If you did not make this change, please contact support immediately.</p>";
        send(toEmail, subject, body);
    }

    @Async
    public void sendTransactionAlert(String toEmail, String firstName, String type,
                                     BigDecimal amount, String accountNumber, String reference) {
        String subject = "NexBank — " + type + " Alert";
        String body = "<h2>Hi " + firstName + ",</h2>"
                + "<p>A <strong>" + type + "</strong> of <strong>₹" + amount + "</strong> "
                + "has been processed on your account <strong>" + accountNumber + "</strong>.</p>"
                + "<p>Reference: " + reference + "</p>";
        send(toEmail, subject, body);
    }

    @Async
    public void sendFraudAlert(String toEmail, String firstName, String message) {
        String subject = "🚨 NexBank Security Alert";
        String body = "<h2>Hi " + firstName + ",</h2><p>" + message + "</p>"
                + "<p>If this was not you, please contact support immediately or freeze your account.</p>";
        send(toEmail, subject, body);
    }

    private void send(String toEmail, String subject, String htmlBody) {
        try {
            Email from = new Email(fromEmail, fromName);
            Email to = new Email(toEmail);
            Content content = new Content("text/html", htmlBody);
            Mail mail = new Mail(from, subject, to, content);

            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);
            if (response.getStatusCode() >= 400) {
                log.error("SendGrid error [{}]: {}", response.getStatusCode(), response.getBody());
            } else {
                log.debug("Email sent to {} [status: {}]", toEmail, response.getStatusCode());
            }
        } catch (IOException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildOtpEmailHtml(String firstName, String otp, String purpose) {
        return """
            <!DOCTYPE html>
            <html>
            <head><style>
              body { font-family: Arial, sans-serif; background: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
              .otp-box { background: #1a2980; color: white; font-size: 36px; font-weight: bold;
                         text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 24px 0; }
              .footer { color: #888; font-size: 12px; margin-top: 24px; }
            </style></head>
            <body>
              <div class="container">
                <h1>🏦 NexBank</h1>
                <h2>Hi %s,</h2>
                <p>Your OTP for <strong>%s</strong> is:</p>
                <div class="otp-box">%s</div>
                <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
                <div class="footer">© 2024 NexBank. All rights reserved.</div>
              </div>
            </body>
            </html>
            """.formatted(firstName, purpose, otp);
    }

    private String buildWelcomeEmailHtml(String firstName) {
        return """
            <!DOCTYPE html>
            <html>
            <head><style>
              body { font-family: Arial, sans-serif; background: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
              .btn { background: #1a2980; color: white; padding: 12px 24px; border-radius: 6px;
                     text-decoration: none; display: inline-block; margin-top: 16px; }
            </style></head>
            <body>
              <div class="container">
                <h1>🏦 Welcome to NexBank!</h1>
                <h2>Hi %s,</h2>
                <p>Your account has been successfully created and verified. You're all set to experience secure, modern banking.</p>
                <p>With NexBank you can:</p>
                <ul>
                  <li>Open Savings &amp; Current accounts</li>
                  <li>Transfer funds instantly</li>
                  <li>Pay via QR &amp; UPI</li>
                  <li>Track every transaction in real time</li>
                </ul>
                <a href="https://nexbank.com/login" class="btn">Get Started →</a>
                <p style="color:#888;font-size:12px;margin-top:24px">© 2024 NexBank. All rights reserved.</p>
              </div>
            </body>
            </html>
            """.formatted(firstName);
    }
}
