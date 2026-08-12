package com.fintech.admin.service;

import com.fintech.admin.entity.SystemBankAccount;
import com.fintech.admin.repository.SystemBankAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemBankAccountService {

    private final SystemBankAccountRepository repository;

    public List<SystemBankAccount> getAllAccounts() {
        return repository.findAll();
    }

    public SystemBankAccount createAccount(SystemBankAccount account) {
        return repository.save(account);
    }

    public SystemBankAccount toggleStatus(Long id) {
        SystemBankAccount account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setActive(!account.isActive());
        return repository.save(account);
    }

    public void deleteAccount(Long id) {
        repository.deleteById(id);
    }
}
