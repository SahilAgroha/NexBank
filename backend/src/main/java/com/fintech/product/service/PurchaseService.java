package com.fintech.product.service;

import com.fintech.common.response.ApiResponse;
import com.fintech.invoice.entity.Invoice;
import com.fintech.invoice.entity.InvoiceItem;
import com.fintech.invoice.entity.InvoiceStatus;
import com.fintech.invoice.repository.InvoiceRepository;
import com.fintech.transaction.entity.Ledger;
import com.fintech.transaction.repository.LedgerRepository;
import com.fintech.product.entity.ServiceProduct;
import com.fintech.product.repository.ServiceProductRepository;
import com.fintech.transaction.entity.Transaction;
import com.fintech.transaction.entity.TransactionStatus;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.transaction.repository.TransactionRepository;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.WalletRepository;
import com.fintech.partner.service.CommissionService;
import com.fintech.ledger.service.LedgerService;
import com.fintech.ledger.entity.LedgerEntryType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final UserRepository userRepository;
    private final ServiceProductRepository productRepository;
    private final WalletRepository walletRepository;
    private final LedgerRepository ledgerRepository;
    private final TransactionRepository transactionRepository;
    private final InvoiceRepository invoiceRepository;
    private final CommissionService commissionService;
    private final LedgerService ledgerService;

    @Transactional
    public Invoice purchaseService(Long userId, Long productId, Integer quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        ServiceProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
                
        if (!product.isActive()) {
            throw new RuntimeException("This service is currently unavailable");
        }

        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .build();
                    return walletRepository.save(newWallet);
                });

        BigDecimal unitPrice = product.getPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.18)).setScale(4, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax);

        if (wallet.getBalance().compareTo(total) < 0) {
            throw new RuntimeException("Insufficient wallet balance. Please recharge your wallet.");
        }

        // Deduct from wallet
        BigDecimal openingBalance = wallet.getBalance();
        wallet.setBalance(wallet.getBalance().subtract(total));
        walletRepository.save(wallet);

        String refNum = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Create Invoice
        Invoice invoice = Invoice.builder()
                .invoiceNumber(refNum)
                .user(user)
                .subtotal(subtotal)
                .taxAmount(tax)
                .totalAmount(total)
                .status(InvoiceStatus.PAID)
                .build();
                
        InvoiceItem item = InvoiceItem.builder()
                .invoice(invoice)
                .serviceName(product.getName())
                .quantity(quantity)
                .unitPrice(unitPrice)
                .totalPrice(subtotal)
                .build();
                
        invoice.setItems(List.of(item));
        invoiceRepository.save(invoice);

        // Record System Ledger
        Ledger ledger = Ledger.builder()
                .amount(total.negate())
                .type(TransactionType.SERVICE_PAYMENT)
                .referenceNumber(refNum)
                .description("Service Purchase: " + product.getName() + " x" + quantity)
                .build();
        ledgerRepository.save(ledger);

        // Record Transaction
        Transaction transaction = Transaction.builder()
                .referenceNumber(refNum)
                .senderWallet(wallet)
                .amount(total)
                .type(TransactionType.SERVICE_PAYMENT)
                .status(TransactionStatus.SUCCESS)
                .description("Service Purchase: " + product.getName())
                .build();
        transaction = transactionRepository.save(transaction);

        // Record User Ledger Entry
        ledgerService.recordEntry(
                wallet, 
                transaction, 
                LedgerEntryType.DEBIT, 
                total, 
                openingBalance, 
                wallet.getBalance(), 
                "Service Purchase: " + product.getName()
        );

        commissionService.distributeCommission(transaction);

        return invoice;
    }
}
