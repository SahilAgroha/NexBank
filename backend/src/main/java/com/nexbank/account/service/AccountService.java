package com.nexbank.account.service;

import com.nexbank.account.dto.AccountDto;
import com.nexbank.account.dto.CreateAccountRequest;
import com.nexbank.account.entity.Account;
import com.nexbank.account.repository.AccountRepository;
import com.nexbank.common.enums.AccountStatus;
import com.nexbank.common.exception.BadRequestException;
import com.nexbank.common.exception.ForbiddenException;
import com.nexbank.common.exception.ResourceNotFoundException;
import com.nexbank.common.util.AccountNumberGenerator;
import com.nexbank.customer.entity.Customer;
import com.nexbank.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerService customerService;

    @Transactional
    public AccountDto createAccount(CreateAccountRequest request) {
        Customer customer = customerService.getAuthenticatedCustomer();

        // Generate unique account number
        String accountNumber;
        do {
            accountNumber = AccountNumberGenerator.generate();
        } while (accountRepository.existsByAccountNumber(accountNumber));

        Account account = Account.builder()
                .customer(customer)
                .accountNumber(accountNumber)
                .accountType(request.getAccountType())
                .status(AccountStatus.ACTIVE)
                .build();

        account = accountRepository.save(account);
        log.info("Account created: {} for customer {}", accountNumber, customer.getId());
        return toDto(account);
    }

    public List<AccountDto> getMyAccounts() {
        Customer customer = customerService.getAuthenticatedCustomer();
        return accountRepository.findByCustomerId(customer.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public AccountDto getAccount(String accountId) {
        Account account = findAndValidateOwnership(accountId);
        return toDto(account);
    }

    @Transactional
    public AccountDto freezeAccount(String accountId) {
        Account account = findAndValidateOwnership(accountId);
        if (account.getStatus() == AccountStatus.FROZEN) {
            throw new BadRequestException("Account is already frozen");
        }
        account.setStatus(AccountStatus.FROZEN);
        return toDto(accountRepository.save(account));
    }

    // Used internally (no ownership check) — called by admin / fraud module
    public Account getAccountEntityByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account", accountNumber));
    }

    public Account getAccountEntityById(String id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", id));
    }

    public Account saveAccount(Account account) {
        return accountRepository.save(account);
    }

    private Account findAndValidateOwnership(String accountId) {
        Customer customer = customerService.getAuthenticatedCustomer();
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", accountId));
        if (!account.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("Account does not belong to you");
        }
        return account;
    }

    public AccountDto toDto(Account a) {
        return AccountDto.builder()
                .id(a.getId())
                .accountNumber(a.getAccountNumber())
                .accountType(a.getAccountType())
                .status(a.getStatus())
                .balance(a.getBalance())
                .ifscCode(a.getIfscCode())
                .branch(a.getBranch())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
