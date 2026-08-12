package com.fintech.ledger.service;

import com.fintech.ledger.entity.LedgerEntry;
import com.fintech.ledger.entity.LedgerEntryType;
import com.fintech.ledger.repository.LedgerEntryRepository;
import com.fintech.transaction.entity.Transaction;
import com.fintech.wallet.entity.Wallet;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private final LedgerEntryRepository ledgerEntryRepository;

    @Transactional
    public void recordEntry(Wallet wallet, Transaction transaction, LedgerEntryType type, 
                            BigDecimal amount, BigDecimal openingBalance, BigDecimal closingBalance, 
                            String description) {
        LedgerEntry entry = LedgerEntry.builder()
                .wallet(wallet)
                .transaction(transaction)
                .type(type)
                .amount(amount)
                .openingBalance(openingBalance)
                .closingBalance(closingBalance)
                .description(description)
                .build();
        ledgerEntryRepository.save(entry);
    }

    public Page<LedgerEntry> getLedgerEntries(Long walletId, LocalDateTime startDate, LocalDateTime endDate, LedgerEntryType type, Pageable pageable) {
        return ledgerEntryRepository.findLedgerEntries(walletId, startDate, endDate, type, pageable);
    }

    public Page<LedgerEntry> getSystemLedgerEntries(LocalDateTime startDate, LocalDateTime endDate, LedgerEntryType type, Pageable pageable) {
        return ledgerEntryRepository.findSystemLedgerEntries(startDate, endDate, type, pageable);
    }

    public void exportLedgerToCsv(PrintWriter writer, Long walletId, LocalDateTime startDate, LocalDateTime endDate, LedgerEntryType type) {
        List<LedgerEntry> entries = ledgerEntryRepository.findAllLedgerEntries(walletId, startDate, endDate, type);
        writeCsv(writer, entries, false);
    }

    public void exportSystemLedgerToCsv(PrintWriter writer, LocalDateTime startDate, LocalDateTime endDate, LedgerEntryType type) {
        List<LedgerEntry> entries = ledgerEntryRepository.findAllSystemLedgerEntries(startDate, endDate, type);
        writeCsv(writer, entries, true);
    }

    private void writeCsv(PrintWriter writer, List<LedgerEntry> entries, boolean isSystem) {
        try {
            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader(isSystem ? 
                            new String[]{"ID", "Date", "Wallet ID", "User Email", "Txn Ref", "Type", "Amount", "Opening Balance", "Closing Balance", "Description"} : 
                            new String[]{"ID", "Date", "Txn Ref", "Type", "Amount", "Opening Balance", "Closing Balance", "Description"})
                    .build();

            try (CSVPrinter csvPrinter = new CSVPrinter(writer, format)) {
                for (LedgerEntry entry : entries) {
                    if (isSystem) {
                        csvPrinter.printRecord(
                                entry.getId(),
                                entry.getCreatedAt(),
                                entry.getWallet().getId(),
                                entry.getWallet().getUser().getEmail(),
                                entry.getTransaction().getReferenceNumber(),
                                entry.getType(),
                                entry.getAmount(),
                                entry.getOpeningBalance(),
                                entry.getClosingBalance(),
                                entry.getDescription()
                        );
                    } else {
                        csvPrinter.printRecord(
                                entry.getId(),
                                entry.getCreatedAt(),
                                entry.getTransaction().getReferenceNumber(),
                                entry.getType(),
                                entry.getAmount(),
                                entry.getOpeningBalance(),
                                entry.getClosingBalance(),
                                entry.getDescription()
                        );
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV file: " + e.getMessage());
        }
    }
}
