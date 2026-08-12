package com.fintech.partner.service;

import com.fintech.partner.entity.CommissionRule;
import com.fintech.partner.repository.CommissionRuleRepository;
import com.fintech.transaction.entity.Transaction;
import com.fintech.transaction.entity.TransactionStatus;
import com.fintech.transaction.entity.TransactionType;
import com.fintech.transaction.repository.TransactionRepository;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.WalletRepository;
import com.fintech.ledger.service.LedgerService;
import com.fintech.ledger.entity.LedgerEntryType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommissionService {

    private final CommissionRuleRepository commissionRuleRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerService ledgerService;

    @Transactional
    public void distributeCommission(Transaction originalTransaction) {
        if (originalTransaction.getSenderWallet() == null) {
            return; // Can't trace back to a user
        }
        
        User currentUser = originalTransaction.getSenderWallet().getUser();
        BigDecimal amount = originalTransaction.getAmount();
        TransactionType type = originalTransaction.getType();
        
        // Loop up the hierarchy
        while (currentUser.getParentPartnerId() != null) {
            Long parentId = currentUser.getParentPartnerId();
            Optional<User> parentOpt = userRepository.findById(parentId);
            
            if (parentOpt.isEmpty()) {
                break; // Hierarchy broken
            }
            
            User parent = parentOpt.get();
            if (parent.getPartnerType() != null) {
                // Find rule for this partner type and transaction type
                Optional<CommissionRule> ruleOpt = commissionRuleRepository
                        .findByPartnerTypeAndTransactionType(parent.getPartnerType(), type);
                        
                if (ruleOpt.isPresent()) {
                    CommissionRule rule = ruleOpt.get();
                    
                    // Calculate commission
                    BigDecimal percentageComm = amount.multiply(rule.getPercentage()).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                    BigDecimal totalComm = percentageComm.add(rule.getFlatFee());
                    
                    if (totalComm.compareTo(BigDecimal.ZERO) > 0) {
                        // Deposit commission to parent's wallet
                        Optional<Wallet> parentWalletOpt = walletRepository.findByUserIdForUpdate(parent.getId());
                        if (parentWalletOpt.isPresent()) {
                            Wallet parentWallet = parentWalletOpt.get();
                            BigDecimal opening = parentWallet.getBalance();
                            BigDecimal closing = opening.add(totalComm);
                            parentWallet.setBalance(closing);
                            walletRepository.save(parentWallet);
                            
                            // Record commission transaction
                            Transaction commTx = Transaction.builder()
                                    .referenceNumber("COMM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                    .receiverWallet(parentWallet)
                                    .amount(totalComm)
                                    .type(TransactionType.COMMISSION)
                                    .status(TransactionStatus.SUCCESS)
                                    .description("Commission for " + type + " from User " + currentUser.getId())
                                    .build();
                                    
                            commTx = transactionRepository.save(commTx);
                            
                            // Record Ledger Entry
                            ledgerService.recordEntry(parentWallet, commTx, LedgerEntryType.CREDIT, totalComm, opening, closing, commTx.getDescription());
                        }
                    }
                }
            }
            // Move up to the next parent
            currentUser = parent;
        }
    }
}
