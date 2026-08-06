package com.nexbank.admin.service;

import com.nexbank.account.entity.Account;
import com.nexbank.account.repository.AccountRepository;
import com.nexbank.account.service.AccountService;
import com.nexbank.audit.service.AuditService;
import com.nexbank.auth.repository.UserRepository;
import com.nexbank.common.enums.AccountStatus;
import com.nexbank.common.enums.KycStatus;
import com.nexbank.common.exception.ResourceNotFoundException;
import com.nexbank.customer.entity.Customer;
import com.nexbank.customer.repository.CustomerRepository;
import com.nexbank.fraud.entity.FraudAlert;
import com.nexbank.fraud.repository.FraudAlertRepository;
import com.nexbank.fraud.service.FraudDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final AuditService auditService;

    public Page<Customer> getAllCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable);
    }

    public Customer getCustomer(String customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));
    }

    @Transactional
    public Account freezeAccountByAdmin(String accountId, String reason) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", accountId));
        String before = account.getStatus().name();
        account.setStatus(AccountStatus.FROZEN);
        account = accountRepository.save(account);
        auditService.log("ADMIN_FREEZE_ACCOUNT", "Account", accountId,
                "{\"status\":\"" + before + "\"}", "{\"status\":\"FROZEN\",\"reason\":\"" + reason + "\"}");
        return account;
    }

    @Transactional
    public Account unfreezeAccount(String accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", accountId));
        account.setStatus(AccountStatus.ACTIVE);
        account = accountRepository.save(account);
        auditService.log("ADMIN_UNFREEZE_ACCOUNT", "Account", accountId, "Account unfrozen by admin");
        return account;
    }

    @Transactional
    public Customer updateKycStatus(String customerId, KycStatus status, String reason) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));
        String before = customer.getKycStatus().name();
        customer.setKycStatus(status);
        customer = customerRepository.save(customer);
        auditService.log("ADMIN_UPDATE_KYC", "Customer", customerId,
                "{\"kycStatus\":\"" + before + "\"}", "{\"kycStatus\":\"" + status + "\",\"reason\":\"" + reason + "\"}");
        return customer;
    }

    public Page<FraudAlert> getUnresolvedFraudAlerts(Pageable pageable) {
        return fraudAlertRepository.findByResolvedFalse(pageable);
    }

    @Transactional
    public void resolveFraudAlert(String alertId) {
        FraudAlert alert = fraudAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("FraudAlert", alertId));
        alert.setResolved(true);
        fraudAlertRepository.save(alert);
        auditService.log("ADMIN_RESOLVE_FRAUD_ALERT", "FraudAlert", alertId, "Alert resolved by admin");
    }
}
