package com.fintech.admin.service;

import com.fintech.admin.dto.MerchantBankAccountResponse;
import com.fintech.user.entity.MerchantBankAccount;
import com.fintech.user.repository.MerchantBankAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettlementAccountService {

    private final MerchantBankAccountRepository repository;

    public List<MerchantBankAccountResponse> getAllSettlementAccounts() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<MerchantBankAccountResponse> getAccountsByMerchant(Long merchantId) {
        return repository.findByMerchantId(merchantId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public MerchantBankAccountResponse updateAccountStatus(Long id, String status) {
        MerchantBankAccount account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Merchant Bank Account not found"));

        account.setStatus(MerchantBankAccount.ApprovalStatus.valueOf(status.toUpperCase()));
        return mapToResponse(repository.save(account));
    }

    private MerchantBankAccountResponse mapToResponse(MerchantBankAccount account) {
        MerchantBankAccountResponse response = new MerchantBankAccountResponse();
        response.setId(account.getId());
        response.setMerchantId(account.getMerchant().getId());
        response.setMerchantName(account.getMerchant().getFullName());
        response.setInstitution(account.getInstitution());
        response.setAccountMetadata(account.getAccountMetadata());
        response.setIfscAndContact(account.getIfscAndContact());
        response.setStatus(account.getStatus());
        response.setCreatedAt(account.getCreatedAt());
        response.setUpdatedAt(account.getUpdatedAt());
        return response;
    }
}
